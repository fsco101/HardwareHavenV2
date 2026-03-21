const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { isValidPushToken } = require('../helpers/pushNotifications');
const crypto = require('crypto');
const { sendEmail, passwordResetCodeEmail, accountDeactivatedEmail } = require('../helpers/emailService');
const { adminOnly } = require('../helpers/jwt');
const { verifyFirebaseIdToken } = require('../helpers/firebaseAdmin');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

function getAuthFromRequest(req) {
    if (req.auth) return req.auth;

    const header = req.headers?.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;

    try {
        return jwt.verify(token, process.env.SECRET);
    } catch {
        return null;
    }
}

function getDeactivationPayload(user) {
    return {
        date: user?.deactivatedAt || null,
        reason: user?.deactivationReason || 'No reason provided by admin.',
    };
}

router.get(`/`, async (req, res) => {
    // const userList = await User.find();
    const userList = await User.find().select('-passwordHash -resetPasswordCodeHash -resetPasswordCodeExpires');
    console.log(userList)

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
})

router.get('/admin/manage', adminOnly, async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const role = String(req.query.role || 'all').trim();
        const status = String(req.query.status || 'all').trim();

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        if (role === 'admin') query.isAdmin = true;
        if (role === 'user') query.isAdmin = false;

        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;

        const users = await User.find(query)
            .select('-passwordHash -resetPasswordCodeHash -resetPasswordCodeExpires')
            .sort({ _id: -1 });

        return res.json(users);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/admin/:id/role', adminOnly, async (req, res) => {
    try {
        const role = String(req.body?.role || '').toLowerCase();
        if (role !== 'admin' && role !== 'user') {
            return res.status(400).json({ success: false, message: 'Role must be either user or admin.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.isAdmin = role === 'admin';
        await user.save();

        const safeUser = await User.findById(user._id).select('-passwordHash -resetPasswordCodeHash -resetPasswordCodeExpires');
        return res.json({ success: true, message: 'User role updated.', user: safeUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/admin/:id/status', adminOnly, async (req, res) => {
    try {
        const isActive = req.body?.isActive;
        const deactivationReason = String(req.body?.deactivationReason || '').trim();
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: 'isActive must be a boolean value.' });
        }

        if (isActive === false && !deactivationReason) {
            return res.status(400).json({ success: false, message: 'Deactivation reason is required.' });
        }

        if (req.auth?.userId && String(req.auth.userId) === String(req.params.id) && isActive === false) {
            return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.isActive = isActive;
        if (isActive) {
            user.deactivatedAt = null;
            user.deactivationReason = '';
        } else {
            user.deactivatedAt = new Date();
            user.deactivationReason = deactivationReason;
        }
        await user.save();

        if (isActive === false && user.email) {
            sendEmail(accountDeactivatedEmail(user, deactivationReason)).catch((err) => {
                console.error('Deactivation email error:', err.message || err);
            });
        }

        const safeUser = await User.findById(user._id).select('-passwordHash -resetPasswordCodeHash -resetPasswordCodeExpires');
        return res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}.`, user: safeUser });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash -resetPasswordCodeHash -resetPasswordCodeExpires');

    if (!user) {
        res.status(500).json({ message: 'The user with the given ID was not found.' })
    }
    res.status(200).send(user);
})

router.post('/', async (req, res) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);

    let password = await bcrypt.hashSync(req.body.password, salt)

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: password,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.put('/:id', async (req, res) => {

    const userExist = await User.findById(req.params.id);
    if (!userExist) return res.status(400).send('User not found');
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    // Support Cloudinary URL for image
    let imagePath = userExist.image || '';
    if (req.body.image && req.body.image.startsWith('http')) {
        imagePath = req.body.image;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name || userExist.name,
            email: req.body.email || userExist.email,
            passwordHash: newPassword,
            phone: req.body.phone || userExist.phone,
            isAdmin: req.body.isAdmin !== undefined ? req.body.isAdmin : userExist.isAdmin,
            image: imagePath,
            street: req.body.street !== undefined ? req.body.street : userExist.street,
            apartment: req.body.apartment !== undefined ? req.body.apartment : userExist.apartment,
            zip: req.body.zip !== undefined ? req.body.zip : userExist.zip,
            city: req.body.city !== undefined ? req.body.city : userExist.city,
            country: req.body.country !== undefined ? req.body.country : userExist.country,
            region: req.body.region !== undefined ? req.body.region : userExist.region,
            province: req.body.province !== undefined ? req.body.province : userExist.province,
            cityMunicipality: req.body.cityMunicipality !== undefined ? req.body.cityMunicipality : userExist.cityMunicipality,
            barangay: req.body.barangay !== undefined ? req.body.barangay : userExist.barangay,
        },
        { new: true }
    )

    if (!user)
        return res.status(400).send('the user cannot be updated!')

    res.send(user);
})

router.post('/login', async (req, res) => {
    console.log(req.body.email)
    const user = await User.findOne({ email: req.body.email })

    const secret = process.env.SECRET;
    if (!user) {
        return res.status(400).json({ success: false, message: 'The user not found' });
    }

    if (user.isActive === false) {
        return res.status(403).json({
            success: false,
            code: 'ACCOUNT_DEACTIVATED',
            message: 'Your account is deactivated. Please contact admin.',
            deactivation: getDeactivationPayload(user),
        });
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )
        console.log(token)

        res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(400).json({ success: false, message: 'password is wrong!' });
    }
})

// Firebase login — find or create user by Firebase UID, issue JWT
router.post('/firebase-login', async (req, res) => {
    const { idToken, email, firebaseUid, name } = req.body;
    const secret = process.env.SECRET;

    let resolvedEmail = email;
    let resolvedFirebaseUid = firebaseUid;
    let resolvedName = name;

    if (idToken) {
        try {
            const decodedToken = await verifyFirebaseIdToken(idToken);
            resolvedFirebaseUid = decodedToken.uid;
            resolvedEmail = decodedToken.email || resolvedEmail;
            resolvedName = decodedToken.name || resolvedName;
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid Firebase ID token' });
        }
    }

    if (!resolvedEmail || !resolvedFirebaseUid) {
        return res.status(400).json({ success: false, message: 'Firebase credentials are required' });
    }

    let user = await User.findOne({ firebaseUid: resolvedFirebaseUid });

    // If user not found by UID, try by email
    if (!user) {
        user = await User.findOne({ email: resolvedEmail });
    }

    // If still no user, create a new one
    if (!user) {
        user = new User({
            name: resolvedName || resolvedEmail.split('@')[0],
            email: resolvedEmail,
            passwordHash: bcrypt.hashSync(resolvedFirebaseUid, 10),
            phone: '',
            firebaseUid: resolvedFirebaseUid,
        });
        user = await user.save();
    } else if (!user.firebaseUid) {
        // Link existing account with Firebase UID
        user.firebaseUid = resolvedFirebaseUid;
        await user.save();
    }

    if (user.isActive === false) {
        return res.status(403).json({
            success: false,
            code: 'ACCOUNT_DEACTIVATED',
            message: 'Your account is deactivated. Please contact admin.',
            deactivation: getDeactivationPayload(user),
        });
    }

    const token = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        secret,
        { expiresIn: '1d' }
    );

    res.status(200).send({ user: user.email, token });
})

router.post('/forgot-password', async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        // Return generic success to avoid account enumeration.
        if (!user) {
            return res.json({ success: true, message: 'If the email exists, a reset code was sent.' });
        }

        const resetCode = String(Math.floor(100000 + Math.random() * 900000));
        const resetCodeHash = crypto.createHash('sha256').update(resetCode).digest('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.resetPasswordCodeHash = resetCodeHash;
        user.resetPasswordCodeExpires = expiresAt;
        await user.save();

        await sendEmail(passwordResetCodeEmail(user, resetCode));

        return res.json({ success: true, message: 'If the email exists, a reset code was sent.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const code = String(req.body?.code || '').trim();
        const newPassword = String(req.body?.newPassword || '');

        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, code, and newPassword are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.resetPasswordCodeHash || !user.resetPasswordCodeExpires) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        if (new Date(user.resetPasswordCodeExpires).getTime() < Date.now()) {
            user.resetPasswordCodeHash = '';
            user.resetPasswordCodeExpires = null;
            await user.save();
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        const incomingHash = crypto.createHash('sha256').update(code).digest('hex');
        if (incomingHash !== user.resetPasswordCodeHash) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
        }

        user.passwordHash = bcrypt.hashSync(newPassword, 10);
        user.resetPasswordCodeHash = '';
        user.resetPasswordCodeExpires = null;
        await user.save();

        return res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/change-password', async (req, res) => {
    try {
        const auth = getAuthFromRequest(req);
        if (!auth?.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const oldPassword = String(req.body?.oldPassword || '');
        const newPassword = String(req.body?.newPassword || '');

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'oldPassword and newPassword are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        const user = await User.findById(auth.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ success: false, message: 'New password must be different from old password' });
        }

        user.passwordHash = bcrypt.hashSync(newPassword, 10);
        await user.save();

        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});


router.post('/register', uploadOptions.single('image'), async (req, res) => {
    const file = req.file;
    let imagePath = '';
    if (file) {
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${file.filename}`;
    }
    // Support Cloudinary URL passed directly from frontend
    if (req.body.image && req.body.image.startsWith('http')) {
        imagePath = req.body.image;
    }

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        image: imagePath,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
        region: req.body.region,
        province: req.body.province,
        cityMunicipality: req.body.cityMunicipality,
        barangay: req.body.barangay,
        firebaseUid: req.body.firebaseUid || '',
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.post('/push-token', async (req, res) => {
    try {
        const auth = getAuthFromRequest(req);
        if (!auth?.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = String(req.body?.token || '').trim();
        if (!isValidPushToken(token)) {
            return res.status(400).json({ success: false, message: 'Invalid push token' });
        }

        await User.findByIdAndUpdate(auth.userId, {
            $addToSet: { pushTokens: token },
        });

        return res.json({ success: true, message: 'Push token saved' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/push-token', async (req, res) => {
    try {
        const auth = getAuthFromRequest(req);
        if (!auth?.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = String(req.body?.token || '').trim();
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        await User.findByIdAndUpdate(auth.userId, {
            $pull: { pushTokens: token },
        });

        return res.json({ success: true, message: 'Push token removed' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});


router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "user not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count)

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    });
})
module.exports = router;
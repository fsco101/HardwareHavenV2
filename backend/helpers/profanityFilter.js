const badWordsList = [
    'anal','anus','arse','ass','ballsack','balls','bastard','bitch',
    'bloody','blowjob','bollock','boner','boob','bugger','bum','butt',
    'clitoris','cock','coon','crap','cunt','damn','dick','dildo','dyke',
    'fag','feck','fellate','fellatio','flange','fuck','goddamn','hell',
    'homo','jerk','jizz','knobend','labia','muff','nigger','nigga',
    'penis','piss','poop','prick','pube','pussy','queer','scrotum',
    'shit','slut','smegma','spunk','tit','tosser','turd','twat',
    'vagina','wank','whore','wtf'
];

class ProfanityFilter {
    constructor(extraWords = []) {
        this.words = [...badWordsList, ...extraWords].map(w => w.toLowerCase());
    }

    clean(text) {
        if (!text) return '';
        let cleaned = text;
        this.words.forEach(word => {
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
            cleaned = cleaned.replace(regex, '*'.repeat(word.length));
        });
        return cleaned;
    }

    isProfane(text) {
        if (!text) return false;
        return this.words.some(word => {
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            return regex.test(text);
        });
    }
}

module.exports = ProfanityFilter;

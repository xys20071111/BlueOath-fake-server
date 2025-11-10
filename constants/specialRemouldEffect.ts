interface AddEffect {
    type: "add"
    new: number
}

interface ReplaceEffect {
    type: 'replace'
    old: number
    new: number
}

type SpecialEffect = AddEffect | ReplaceEffect

export const SPECIAL_REMOULD_EFFECT: Record<string, SpecialEffect> = {
    "1": {
        "type": "replace",
        "old": 11043,
        "new": 11046
    },
    "14": {
        "type": "add",
        "new": 11042
    },
    "44": {
        "type": "replace",
        "old": 10131,
        "new": 10134
    },
    "57": {
        "type": "add",
        "new": 10132
    },
    "87": {
        "type": "replace",
        "old": 10453,
        "new": 10456
    },
    "100": {
        "type": "add",
        "new": 10452
    },
    "130": {
        "type": "replace",
        "old": 11011,
        "new": 11014
    },
    "143": {
        "type": "add",
        "new": 11012
    },
    "173": {
        "type": "replace",
        "old": 11033,
        "new": 11036
    },
    "186": {
        "type": "add",
        "new": 11032
    },
    "216": {
        "type": "replace",
        "old": 10673,
        "new": 10676
    },
    "229": {
        "type": "add",
        "new": 10672
    },
    "259": {
        "type": "replace",
        "old": 11423,
        "new": 11426
    },
    "272": {
        "type": "add",
        "new": 11427
    },
    "302": {
        "type": "replace",
        "old": 10042,
        "new": 10045
    },
    "315": {
        "type": "add",
        "new": 10047
    },
    "345": {
        "type": "replace",
        "old": 10981,
        "new": 10984
    },
    "358": {
        "type": "add",
        "new": 10982
    },
    "388": {
        "type": "replace",
        "old": 10633,
        "new": 10636
    },
    "401": {
        "type": "add",
        "new": 10632
    },
    "431": {
        "type": "replace",
        "old": 10463,
        "new": 10466
    },
    "444": {
        "type": "add",
        "new": 10462
    },
    "474": {
        "type": "replace",
        "old": 10783,
        "new": 10786
    },
    "487": {
        "type": "add",
        "new": 10782
    },
    "517": {
        "type": "replace",
        "old": 10141,
        "new": 10144
    },
    "530": {
        "type": "add",
        "new": 10142
    },
    "560": {
        "type": "replace",
        "old": 10533,
        "new": 10536
    },
    "573": {
        "type": "add",
        "new": 10532
    }
}
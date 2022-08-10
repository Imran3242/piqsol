class Metadata {
    key;
    updateAuthority;
    mint;
    data;
    primarySaleHappened;
    isMutable;
    editionNonce;
    constructor(args: any) {
        var _a;
        this.key = 4;
        this.updateAuthority = args.updateAuthority;
        this.mint = args.mint;
        this.data = args.data;
        this.primarySaleHappened = args.primarySaleHappened;
        this.isMutable = args.isMutable;
        this.editionNonce = (_a = args.editionNonce) !== null && _a !== void 0 ? _a : null;
    }
}

class CreateMetadataArgs {
    instruction;
    data;
    isMutable;
    constructor(args: any) {
        this.instruction = 0;
        this.data = args.data;
        this.isMutable = args.isMutable;
    }
}

class CreateMasterEditionArgs {
    instruction;
    maxSupply;
    constructor(args: any) {
        this.instruction = 10;
        this.maxSupply = args.maxSupply;
    }
}

class UpdateMetadataArgs {
    instruction;
    data;
    updateAuthority;
    primarySaleHappened;
    constructor(args: any) {
        this.instruction = 1;
        this.data = args.data ? args.data : null;
        this.updateAuthority = args.updateAuthority ? args.updateAuthority : null;
        this.primarySaleHappened = args.primarySaleHappened;
    }
}

class Data {
    name;
    symbol;
    uri;
    sellerFeeBasisPoints;
    creators;
    constructor(args: any) {
        this.name = args.name;
        this.symbol = args.symbol;
        this.uri = args.uri;
        this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
        this.creators = args.creators;
    }
}


class Creator {
    address;
    verified;
    share;
    constructor(args: any) {
        this.address = args.address;
        this.verified = args.verified;
        this.share = args.share;
    }
}

// @ts-ignore
const METADATA_SCHEMA = new Map<any, any>([
    [
        CreateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', Data],
                ['isMutable', 'u8'], // bool
            ],
        },
    ],
    [
        CreateMasterEditionArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['maxSupply', { kind: 'option', type: 'u64' }],
            ],
        },
    ],
    [
        UpdateMetadataArgs,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', { kind: 'option', type: Data }],
                ['updateAuthority', { kind: 'option', type: 'pubkeyAsString' }],
                ['primarySaleHappened', { kind: 'option', type: 'u8' }],
            ],
        },
    ],
    [
        Data,
        {
            kind: 'struct',
            fields: [
                ['name', 'string'],
                ['symbol', 'string'],
                ['uri', 'string'],
                ['sellerFeeBasisPoints', 'u16'],
                ['creators', { kind: 'option', type: [Creator] }],
            ],
        },
    ],
    [
        Creator,
        {
            kind: 'struct',
            fields: [
                ['address', 'pubkeyAsString'],
                ['verified', 'u8'],
                ['share', 'u8'],
            ],
        },
    ],
    [
        Metadata,
        {
            kind: 'struct',
            fields: [
                ['key', 'u8'],
                ['updateAuthority', 'pubkeyAsString'],
                ['mint', 'pubkeyAsString'],
                ['data', Data],
                ['primarySaleHappened', 'u8'],
                ['isMutable', 'u8'],
                ['editionNonce', { kind: 'option', type: 'u8' }],
            ],
        },
    ],
]);

export {METADATA_SCHEMA}
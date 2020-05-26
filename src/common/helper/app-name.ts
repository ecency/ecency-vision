interface ObjInput {
    name?: string
}

export default (input: string | null | undefined | ObjInput) => {
    if (!input) {
        return '';
    }

    if (typeof input === 'string') {
        return input;
    }

    if (typeof input === 'object' && input.name !== undefined) {
        return input.name;
    }

    return '';
};

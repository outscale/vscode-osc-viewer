declare module "crypto" {
    namespace webcrypto {
        const subtle: SubtleCrypto;
        function getRandomValues<T extends ArrayBufferView | null>(array: T): T;
        /** Available only in secure contexts. */
        function randomUUID(): string;
    }
}
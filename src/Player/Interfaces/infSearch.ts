export default interface infSearchParams {
    fields: string;
    sort?: string;
    limit: number;
    created_after?: number;
    search?: string;
    private?: number;
    flags?: string;
    longer_than?: number;
    owners?: string;
    channel?: string;
    exclude_ids?: string;
    language?: string;
}
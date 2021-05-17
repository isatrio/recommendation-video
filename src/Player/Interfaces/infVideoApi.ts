import infVideo from './infVideo';

export default interface InfVideoApi {
    explicit: boolean;
    has_more: boolean;
    limit: number;
    page: number;
    total: number;
    list: infVideo[];
}
export interface apiResponse<T> {
    status: boolean;
    resp: Response;
    json: T;
}

export interface apiError {
    error?: string;
}

const call = async <TResponse, TRequestBody = Record<string, unknown>>(
    url: string,
    method: string,
    body?: TRequestBody
): Promise<apiResponse<TResponse>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json; charset=UTF-8'
    };
    const opts: RequestInit = {
        mode: 'cors',
        credentials: 'include',
        method: method.toUpperCase()
    };
    const token = localStorage.getItem('token');
    if (token != '') {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (method === 'POST' && body) {
        opts['body'] = JSON.stringify(body);
    }
    opts.headers = headers;
    const resp = await fetch(url, opts);
    if (resp.status === 403 && token != '') {
        throw apiErr('invalid token', resp);
    }
    if (!resp.status) {
        throw apiErr('Invalid response code', resp);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = ((await resp.json()) as TResponse as any).data;
    if (json?.error && json.error !== '') {
        throw apiErr(`Error received: ${json.error}`, resp);
    }
    return { json: json, resp: resp, status: resp.ok };
};

class ApiException extends Error {
    public resp: Response;

    constructor(msg: string, response: Response) {
        super(msg);
        this.resp = response;
    }
}

const apiErr = (msg: string, resp: Response): ApiException => {
    return new ApiException(msg, resp);
};

export enum profileState {
    Incomplete = 0,
    Setup = 1
}

export enum communityVisibilityState {
    Private = 1,
    FriendOnly = 2,
    Public = 3
}

export interface SteamProfile {
    // PlayerSummaries shape
    steamid: string;
    communityvisibilitystate: communityVisibilityState;
    profilestate: profileState;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    personastate: number;
    realname: string;
    primaryclanid: string; // ? should be number
    timecreated: number;
    personastateflags: number;
    loccountrycode: string;
    locstatecode: string;
    loccityid: number;
}

export interface Person {
    steam_id: string;
    patreon_user_id: string;
    permission_level: PermissionLevel;
    last_login: string;
    created_on: string;
    updated_on: string;
    steam_profile: SteamProfile;
    friends: Person[];
}

export interface playerInfo {
    steamid: string;
    name: string;
    user_id: string;
    connected_secs: number;
}

export interface Server {
    server_id: number;
    server_name: string;
    server_name_long: string;
    address: string;
    port: number;
    password_protected: boolean;
    vac: boolean;
    region: string;
    cc: string;
    latitude: number;
    longitude: number;
    distance: number;
    current_map: string;
    default_map: string;
    tags: string[];
    reserved_slots: number;
    created_on: Date;
    updated_on: Date;
    players_max: number;
    players: playerInfo[];
}

export interface News {
    news_id: number;
    title: string;
    body_md: string;
    body_html: string;
    created_on: string;
    updated_on: string;
    published: boolean;
}

export interface NewsUpdatePayload {
    title: string;
    body_md: string;
    published: boolean;
}

export interface DemoArchive {

}

export enum PermissionLevel {
    Guest = 1,
    Banned = 2,
    Authenticated = 10,
    Moderator = 50,
    Admin = 100
}

export const fetchServers = async () => {
    const resp = await call<Server[]>('/api/servers', 'get');
    return resp.json.map(value => {return {...value, "distance": 0}});
};

export const getCurrentProfile = async (): Promise<Person | apiError> => {
    const resp = await call<Person>(`/api/whoami`, 'GET');
    return resp.json;
};

export const getProfile = async (
    query: string
): Promise<Person | apiError> => {
    const resp = await call<Person>(
        `/api/profile?query=${query}`,
        'GET'
    );
    return resp.json;
};

export const getNews = async (): Promise<News[] | apiError> =>
    (await call<News[]>(`/api/news`, 'GET')).json

export const deleteNews = async (newsId: number): Promise<boolean> =>
    (await call(`/api/news/${newsId}`, 'DELETE')).status;

export const updateNews = async (newsId: number, payload: NewsUpdatePayload): Promise<boolean> =>
    (await call(`/api/news/${newsId}`, 'POST', payload)).status;

export const createNews = async (news: NewsUpdatePayload): Promise<News> =>
    (await call<News, NewsUpdatePayload>(`/api/news`, 'POST', news)).json;

export const getDemos = async (): Promise<DemoArchive[] | apiError> =>
    (await call<DemoArchive[]>(`/api/demos`, 'GET')).json
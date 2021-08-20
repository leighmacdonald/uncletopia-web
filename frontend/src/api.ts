
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

export interface Person {
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

    // Custom attributes
    steam_id: string;
    ip_addr: string;
    created_on: Date;
    updated_on: Date;
}

export interface PlayerProfile {
    player: Person;
    friends: Person[];
}

export interface ServerState {
    PlayersCount: number
    PlayersMax: number
    ServerName: string
    Version: string
    Edicts: number[]
    Tags: string[]
    Map: string
    Players: any
}

export interface Server {
    server_id: number
    name_short: string
    name_long: string
    host: string
    port: number
    password_required: boolean
    region: string
    is_enabled: boolean
    cc: string
    latitude: number
    longitude: number
    last_has_players: Date
    state: ServerState
}

export enum PermissionLevel {
    Guest = 1,
    Banned = 2,
    Authenticated = 10,
    Moderator = 50,
    Admin = 100
}

export const fetchServers = async () => {
    const resp = await call<Server[]>("/api/servers", "get")
    return resp.json;
}

export const getCurrentProfile = async (): Promise<
    PlayerProfile | apiError
    > => {
    const resp = await call<PlayerProfile>(`/api/whoami`, 'GET');
    return resp.json;
};

export const getProfile = async (
    query: string
): Promise<PlayerProfile | apiError> => {
    const resp = await call<PlayerProfile>(
        `/api/profile?query=${query}`,
        'GET'
    );
    return resp.json;
};
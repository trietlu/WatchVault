declare module 'react-facebook-login-component' {
    import type { ReactNode } from 'react';

    export interface FacebookLoginResponse {
        accessToken?: string;
        userID?: string;
    }

    interface FacebookLoginProps {
        appId: string;
        autoLoad?: boolean;
        fields?: string;
        callback: (response: FacebookLoginResponse) => void;
        cssClass?: string;
        textButton?: string;
        icon?: ReactNode;
    }

    export function FacebookLogin(props: FacebookLoginProps): ReactNode;
}

import ThirdParty from 'supertokens-auth-react/recipe/thirdparty';
import Session from 'supertokens-auth-react/recipe/session';
import { notifyAuth } from './notifyAuth';

const supertokensConfig = {
  appInfo: {
    appName: 'Forma Urbana',
    apiDomain: import.meta.env.VITE_SUPERTOKENS_API_DOMAIN,
    websiteDomain: import.meta.env.VITE_SUPERTOKENS_WEBSITE_DOMAIN,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [ThirdParty.Google.init()],
      },
    }),
    Session.init({
      onHandleEvent: (ctx) => {
        // sessionExpiredOrRevoked=true means the user had a session that's gone now;
        // false means there was never a session (e.g., first visit) and no notice is warranted.
        if (ctx.action === 'UNAUTHORISED' && ctx.sessionExpiredOrRevoked) {
          notifyAuth('session_expired');
        }
      },
    }),
  ],
};

export default supertokensConfig;

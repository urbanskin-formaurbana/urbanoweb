import ThirdParty from 'supertokens-auth-react/recipe/thirdparty';
import Session from 'supertokens-auth-react/recipe/session';

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
    Session.init(),
  ],
};

export default supertokensConfig;

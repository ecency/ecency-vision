const APP_NAME = "esteemapp";
const SCOPE = "vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance,offline";
const REDIR_URL = "http://localhost:3000/";

export const hsLogin = () => {
  const authUrl = `https://hivesigner.com/oauth2/authorize?client_id=${APP_NAME}&redirect_uri=${encodeURIComponent(
    REDIR_URL
  )}&response_type=code&scope=${encodeURIComponent(SCOPE)}`;

  const win = window.open(authUrl)
 

  const windowInt = setInterval(() => {
  
  }, 200);
};

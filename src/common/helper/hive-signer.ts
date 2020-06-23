export const getAuthUrl = () => {
  const app = "ecency.app";
  const scope = "vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance,offline";
  const redir = `${window.location.origin}/auth`;

  return `https://hivesigner.com/oauth2/authorize?client_id=${app}&redirect_uri=${encodeURIComponent(
    redir
  )}&response_type=code&scope=${encodeURIComponent(scope)}`;
};

export const getTokenUrl = (code: string, secret: string) => {
  return `https://hivesigner.com/api/oauth2/token?code=${code}&client_secret=${secret}`;
};

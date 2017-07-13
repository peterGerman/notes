/**
 * Google Analytics / TestPilot Metrics
 */
const TRACKING_ID = 'UA-101177676-1';

browser.storage.local.get('UID').then((data) => {
  let UID;
  // Read the previous UID value or create a new one
  if (!data.hasOwnProperty('UID')) {
    UID = window.crypto.getRandomValues(new Uint32Array(1)).toString();
    browser.storage.local.set({UID});  // Save it for next time
  } else {
    UID = data.UID;
  }
  const { sendEvent } = new Metrics({
    id: 'notes@mozilla.com',
    version: '1.3.0',
    tid: TRACKING_ID,
    uid: UID
  });

  sendEvent({ object: 'webext-loaded', method: 'click' });
  
  browser.runtime.onMessage.addListener(function(eventData) {
  switch (eventData.action) {
    case 'authenticate':
        sendEvent({
          object: 'webext-button-authenticate',
          method: 'click'
        });

        const fxaKeysUtil = new FxaCrypto.relier.OAuthUtils();

        fxaKeysUtil.launchFxaScopedKeyFlow({
            client_id: 'c6d74070a481bc10',
            oauth_uri: 'http://127.0.0.1:9010/v1',
            pkce: true,
            redirect_uri: browser.identity.getRedirectURL(),
            scopes: ['profile', 'https://identity.mozilla.org/apps/notes'],
          }).then((loginDetails) => {
            console.log('access token + keys', loginDetails);
            chrome.runtime.sendMessage({
              action: 'authenticated',
              bearer: loginDetails.access_token,
              keys: loginDetails.keys
            });

        }, (err) => {
            console.log('login failed', err);
            chrome.runtime.sendMessage({
              action: 'authenticated',
              err: err
            });
            throw err;
          });
        break;
    }
  });
});

// Server-only OMPAY TruePay client. Never import this module into client components.
const endpoints = { sandbox: 'https://api.sandbox.truepay.ompay.om', production: 'https://api.truepay.ompay.om' };
export function createOmpayClient({key, secret, environment = 'sandbox', fetchImpl = fetch}) {
  if (!key || !secret || !Object.hasOwn(endpoints, environment)) throw new Error('Invalid OMPAY configuration');
  const origin = endpoints[environment];
  async function request(path, body) {
    const response = await fetchImpl(origin + path, {method: 'POST', headers: {'Content-Type': 'application/json', 'OMPAY-API-Key': key, 'OMPAY-API-Secret': secret}, body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(15000)});
    let result; try { result = await response.json(); } catch { const error=new Error('Invalid OMPAY response'); error.code='GATEWAY_JSON'; throw error; }
    if (!response.ok || result?.success !== true || !result.data) { const error=new Error('OMPAY request failed'); error.code=`HTTP_${response.status}`; throw error; }
    return result.data;
  }
  return {
    async createCheckout({amountBaisa, reference, returnUrl}) {
      if (!Number.isSafeInteger(amountBaisa) || amountBaisa <= 0 || typeof reference !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(reference)) throw new Error('Invalid order');
      const url = new URL(returnUrl); if (url.protocol !== 'https:') throw new Error('Invalid return URL');
      const data = await request('/api/v1/transactions/bank-hosted', {amount: amountBaisa / 1000, currency: 'OMR', return_url: url.toString(), reference_number: reference});
      let redirect; try { redirect = new URL(data.redirect_url); } catch { const error=new Error('Invalid checkout response'); error.code='GATEWAY_URL'; throw error; }
      if (redirect.protocol !== 'https:') { const error=new Error('Invalid checkout response'); error.code='GATEWAY_SCHEME'; throw error; }
      if (redirect.origin !== origin) { const error=new Error('Invalid checkout response'); error.code='GATEWAY_ORIGIN'; throw error; }
      if (typeof data.transaction_id !== 'string') { const error=new Error('Invalid checkout response'); error.code='GATEWAY_ID'; throw error; }
      if (data.status !== 'PROCESSING') { const error=new Error('Invalid checkout response'); error.code='GATEWAY_STATUS'; throw error; }
      return {transactionId: data.transaction_id, redirectUrl: redirect.toString()};
    },
    async inquire(transactionId, reference) {
      const value=transactionId || reference;
      if (typeof value !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(value)) throw new Error('Invalid transaction reference');
      return request('/api/v1/transactions/inquiry', transactionId ? {transaction_id: transactionId} : {reference_number: reference});
    }
  };
}

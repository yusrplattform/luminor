// Server-only OMPAY TruePay client. Never import this module into client components.
const endpoints = { sandbox: 'https://api.sandbox.truepay.ompay.om', production: 'https://api.truepay.ompay.om' };
export function createOmpayClient({key, secret, environment = 'sandbox', fetchImpl = fetch}) {
  if (!key || !secret || !Object.hasOwn(endpoints, environment)) throw new Error('Invalid OMPAY configuration');
  const origin = endpoints[environment];
  async function request(path, body) {
    const response = await fetchImpl(origin + path, {method: 'POST', headers: {'Content-Type': 'application/json', 'OMPAY-API-Key': key, 'OMPAY-API-Secret': secret}, body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(15000)});
    let result; try { result = await response.json(); } catch { throw new Error('Invalid OMPAY response'); }
    if (!response.ok || result?.success !== true || !result.data) throw new Error('OMPAY request failed');
    return result.data;
  }
  return {
    async createCheckout({amountBaisa, reference, returnUrl}) {
      if (!Number.isSafeInteger(amountBaisa) || amountBaisa <= 0 || typeof reference !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(reference)) throw new Error('Invalid order');
      const url = new URL(returnUrl); if (url.protocol !== 'https:') throw new Error('Invalid return URL');
      const data = await request('/api/v1/transactions/bank-hosted', {amount: amountBaisa / 1000, currency: 'OMR', return_url: url.toString(), reference_number: reference});
      const redirect = new URL(data.redirect_url); if (redirect.protocol !== 'https:' || redirect.origin !== origin || typeof data.transaction_id !== 'string' || data.status !== 'PROCESSING') throw new Error('Invalid checkout response');
      return {transactionId: data.transaction_id, redirectUrl: redirect.toString()};
    },
    async inquire(transactionId) {
      if (typeof transactionId !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(transactionId)) throw new Error('Invalid transaction ID');
      return request('/api/v1/transactions/inquiry', {transaction_id: transactionId});
    }
  };
}

import {database} from '../../../../lib/db';
import {claimPaidPurchase} from '../../../../lib/meta-purchase.mjs';
export const runtime='nodejs';
export async function POST(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({error:'Forbidden'}, {status:403});
  let order;
  try { ({order} = await request.json()); } catch { return Response.json({error:'Invalid request'}, {status:400}); }
  if (typeof order !== 'string' || !/^[a-f0-9-]{36}$/.test(order)) return Response.json({error:'Invalid request'}, {status:400});
  try {
    const purchase=await claimPaidPurchase(database(),order);
    return Response.json({purchase}, {headers:{'Cache-Control':'no-store'}});
  } catch {
    return Response.json({error:'Purchase tracking unavailable'}, {status:503,headers:{'Cache-Control':'no-store'}});
  }
}

import {createHash} from 'node:crypto';

// The atomic insert makes repeated browser returns and concurrent tabs idempotent.
export async function claimPaidPurchase(db, orderId) {
  const result = await db.query(`WITH claimed AS (
    INSERT INTO meta_purchase_claims (order_id)
    SELECT id FROM orders WHERE id=$1 AND payment_status='paid'
    ON CONFLICT (order_id) DO NOTHING RETURNING order_id
  ) SELECT o.items,o.total_baisa,o.currency FROM orders o
    JOIN claimed c ON c.order_id=o.id`, [orderId]);
  if (!result.rows.length) return null;
  const {items,total_baisa:total,currency} = result.rows[0];
  const ids = Array.isArray(items) ? items.map(item => item.id) : [];
  if (!ids.length || !ids.every(id => typeof id === 'string' && /^\d+$/.test(id)) || !Number.isSafeInteger(total) || total < 0 || currency !== 'OMR') return null;
  return {content_ids:ids,value:total/1000,currency,eventID:createHash('sha256').update('luminor-purchase:'+orderId).digest('hex')};
}

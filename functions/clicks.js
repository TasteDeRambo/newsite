const faunadb = require('faunadb');

exports.handler = async (event, context) => {
  const q = faunadb.query;
  const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY });

  // Check if the document exists
  const doesDocExist = await client.query(q.Exists(q.Match(q.Index('clicks_by_slug'), 'clickCount')));

  // If the document doesn't exist, create it
  if (!doesDocExist) {
    await client.query(q.Create(q.Collection('clickCountData'), { data: { slug: 'clickCount', clicks: 1 } }));
  }

  // Get the document
  const document = await client.query(q.Get(q.Match(q.Index('clicks_by_slug'), 'clickCount')));

  // Update the clickCount in the document
  await client.query(q.Update(document.ref, { data: { clicks: document.data.clicks + 1 } }));

  // Get the updated document
  const updatedDocument = await client.query(q.Get(q.Match(q.Index('clicks_by_slug'), 'clickCount')));

  // Return the updated clickCount
  return { statusCode: 200, body: JSON.stringify({ clicks: updatedDocument.data.clicks }) };
};

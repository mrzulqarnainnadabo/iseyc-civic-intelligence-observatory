import assert from 'node:assert/strict';
import fs from 'node:fs';

const schema = JSON.parse(fs.readFileSync(new URL('../contracts/shared/community-record.v0.1.schema.json', import.meta.url), 'utf8'));
const expected = [
  'id', 'contractVersion', 'publicationStatus', 'verificationStatus', 'text',
  'sector', 'duty', 'issueCategory', 'state', 'lga', 'ward', 'facilityRef',
  'officeLabel', 'reportedAt', 'publishedAt', 'createdAt', 'evidenceRefIds',
  'followUpStatus', 'relatedSuggestedIds',
];
assert.equal(schema.additionalProperties, false);
assert.deepEqual([...schema.required].sort(), [...expected].sort());
assert.deepEqual(Object.keys(schema.properties).sort(), [...expected].sort());
assert.equal(schema.properties.contractVersion.const, '0.1.0');
assert.equal(schema.properties.publicationStatus.const, 'published');
assert.equal(schema.properties.text.minLength, 1);
assert.deepEqual(schema.properties.verificationStatus.enum, [
  'unverified', 'partially-verified', 'independently-verified', 'unknown',
]);
assert.deepEqual(schema.properties.followUpStatus.enum, [
  'none', 'under-review', 'response-documented', 'outcome-unknown', 'unknown',
]);
console.log('verify-community-record-schema: PASS');

INSERT INTO users (id, name, last_name, document) VALUES (
  '94be60b2-339f-405f-b3e9-d929847db5de',
  'Juan',
  'López',
  '1053000000'
) ON CONFLICT DO NOTHING;

INSERT INTO accounts (id, user_id, balance, currency) VALUES (
  'e502118d-3d64-4690-bdcb-18a415225dde',
  '94be60b2-339f-405f-b3e9-d929847db5de',
  '100000.00',
  'COP'
) ON CONFLICT DO NOTHING;

insert into public.questions (id, section, prompt, choices, answer, explain, desmos, skill, difficulty)
values
  ('m1', 'Math', 'If 3x + 7 = 22, what is the value of x?', '["3", "5", "7", "15"]'::jsonb, 1, 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.', null, 'linear', 1),
  ('m2', 'Math', 'A jacket priced at $80 is marked up 25%, then sold at 20% off the new price. What is the sale price?', '["$80", "$76", "$84", "$100"]'::jsonb, 0, 'After markup: 80 × 1.25 = 100. After 20% off: 100 × 0.80 = 80.', null, 'percents', 4),
  ('m3', 'Math', 'What is the slope of the line through (2, 3) and (6, 11)?', '["1", "2", "3", "4"]'::jsonb, 1, '(11 − 3) / (6 − 2) = 8 / 4 = 2.', 'y-3=2(x-2)', 'functions', 2),
  ('m4', 'Math', 'If f(x) = x² − 5x + 6, what is f(3)?', '["0", "2", "6", "12"]'::jsonb, 0, '9 − 15 + 6 = 0.', 'y=x^2-5x+6', 'quadratics', 2),
  ('m5', 'Math', '24 is what percent of 80?', '["24%", "30%", "32%", "40%"]'::jsonb, 1, '24 ÷ 80 = 0.30, which is 30%.', null, 'percents', 1),
  ('m6', 'Math', 'Solve for y: 2(y − 4) = 3y + 1', '["−9", "−7", "7", "9"]'::jsonb, 0, '2y − 8 = 3y + 1. Then −8 − 1 = 3y − 2y, so y = −9.', null, 'linear', 2),
  ('r1', 'Reading', 'Unlike the rumor mill of social media, a scientific paper is designed to be slow. Reviewers poke holes. Authors revise. The delay is not a bug; it is the product. Speed sells. Carefulness, less so.', '["social media is more accurate than journals", "scientific delay is a feature of careful work", "reviewers should work faster", "authors should avoid revision"]'::jsonb, 1, 'The passage calls delay “the product,” contrasting it with speed.', null, 'reading-claim', 2),
  ('w1', 'Writing', 'Choose the option that best completes the sentence: “Each of the essays ___ a clear thesis.”', '["have", "has", "having", "were having"]'::jsonb, 1, '“Each” is singular, so the verb is “has.”', null, 'writing-grammar', 1)
on conflict (id) do nothing;
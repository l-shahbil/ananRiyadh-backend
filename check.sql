SELECT id, facing, facing2, facing3 FROM "Listing" WHERE facing::text IN ('corner', 'three_sides') OR facing2::text IN ('corner', 'three_sides') OR facing3::text IN ('corner', 'three_sides');

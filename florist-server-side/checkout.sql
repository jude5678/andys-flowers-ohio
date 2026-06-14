SELECT
  il.inventory_item_id,
  sl.name AS warehouse,
  il.stocked_quantity,
  il.reserved_quantity,
  (il.stocked_quantity - il.reserved_quantity) AS available_quantity
FROM inventory_level il
JOIN stock_location sl ON sl.id = il.location_id
WHERE il.deleted_at IS NULL
AND (il.stocked_quantity - il.reserved_quantity) > 0;
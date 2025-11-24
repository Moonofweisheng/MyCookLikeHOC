-- 统计指定分类的菜谱数量
drop function if exists count_recipes_by_category(text);

create function count_recipes_by_category(cat text)
returns table(count bigint)
language sql
stable
as $$
  select count(*)::bigint as count
  from recipes r
  where r.category = cat;
$$;

grant execute on function count_recipes_by_category(text) to anon, authenticated;

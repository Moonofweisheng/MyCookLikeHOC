-- 同分类随机推荐若干菜，排除当前菜谱
drop function if exists get_random_recipes_by_category(text, uuid, int);

create function get_random_recipes_by_category(cat text, exclude_id uuid, n int default 5)
returns setof recipes
language sql
stable
as $$
  select r.*
  from recipes r
  where r.category = cat
    and (exclude_id is null or r.id <> exclude_id)
  order by random()
  limit n;
$$;

grant execute on function get_random_recipes_by_category(text, uuid, int) to anon, authenticated;

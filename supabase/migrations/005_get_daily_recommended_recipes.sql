-- 每天（按日期种子）从每个分类随机选取 2 道菜
drop function if exists get_daily_recommended_recipes(date);

create function get_daily_recommended_recipes(seed_date date default current_date)
returns setof recipes
language sql
stable
as $$
  select r.*
  from (
    select distinct category from recipes
    where category is not null and category != '' and category != '配料'
  ) c
  cross join lateral (
    select *
    from recipes r
    where r.category = c.category
    order by md5(r.id::text || seed_date::text)
    limit 2
  ) r;
$$;

grant execute on function get_daily_recommended_recipes(date) to anon, authenticated;

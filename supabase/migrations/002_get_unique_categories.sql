drop function if exists get_unique_categories();

create function get_unique_categories()
returns table(category text)
language sql
stable
as $$
  select distinct r.category
  from recipes r
  where r.category is not null
    and r.category != ''
    and r.category != '配料'
  order by r.category asc;
$$;

grant execute on function get_unique_categories() to anon, authenticated;

drop function if exists get_unique_categories();

create function get_unique_categories()
returns table(category text, icon_url text)
language sql
stable
as $$
  select distinct r.category,
    'https://esvjqyeclwopbannnodb.supabase.co/storage/v1/object/public/category-icons/' ||
    case r.category
      when '主食' then 'staple.png'
      when '凉拌' then 'cold-dish.png'
      when '卤菜' then 'braised.png'
      when '早餐' then 'breakfast.png'
      when '汤' then 'soup.png'
      when '炒菜' then 'stir-fry.png'
      when '炖菜' then 'stew.png'
      when '炸品' then 'deep-fry.png'
      when '烤类' then 'grill.png'
      when '烫菜' then 'hot-dish.png'
      when '煮锅' then 'hotpot.png'
      when '蒸菜' then 'steam.png'
      when '砂锅菜' then 'casserole.png'
      when '饮品' then 'drink.png'
      else 'staple.png'
    end || '?width=160&height=160&quality=80&resize=fill' as icon_url
  from recipes r
  where r.category is not null
    and r.category != ''
    and r.category != '配料'
  order by r.category asc;
$$;

grant execute on function get_unique_categories() to anon, authenticated;

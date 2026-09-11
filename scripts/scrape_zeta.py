import json, os, re, time
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

BASE = os.getenv('ZETA_BASE', 'https://astana.zeta.kz')
MAX_PAGES = int(os.getenv('MAX_PAGES', '20'))
MAX_PRODUCTS = int(os.getenv('MAX_PRODUCTS', '250'))
DELAY = float(os.getenv('DELAY', '0.25'))
OUT = os.getenv('OUT', 'data.json')

S = requests.Session()
S.headers.update({'User-Agent':'Mozilla/5.0 (compatible; ZETA-MVP-Inventory/1.0; +https://github.com/)'} )

STORE_ALIASES = {
    'Жибек Жолы 55':'Бирлик 55',
    'Кенесары 4':'Кенесары 4',
    'Бараева':'Бараева 2Б «Z-Home»',
    'Сатпаева 18':'Сатпаева 18',
    'Алаш 15':'шоссе Алаш 15',
    'Коргалжынское шоссе 3/3':'Коргалжынское шоссе 13/3',
}

def text(el):
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)) if el else ''

def get(url):
    r=S.get(url, timeout=25)
    r.raise_for_status()
    return r.text

def catalog_links(html):
    soup=BeautifulSoup(html,'html.parser')
    links=[]
    for a in soup.select('a[href]'):
        href=urljoin(BASE,a.get('href'))
        if urlparse(href).netloc != urlparse(BASE).netloc: continue
        path=urlparse(href).path
        label=text(a)
        if '/catalog/' in path and path.rstrip('/').count('/') >= 2 and label:
            if href not in links and not path.endswith('/catalog/'):
                links.append(href)
    return links

def parse_product(url, html):
    soup=BeautifulSoup(html,'html.parser')
    h1=soup.find('h1')
    if not h1: return None
    name=text(h1)
    body=text(soup)
    if 'Артикул' not in body: return None
    m=re.search(r'Артикул\s*:\s*([^\n]+?)\s+([\d\s]+)\s*₸', body)
    sku=''
    if m: sku=m.group(1).strip()
    pm=re.search(r'Артикул\s*:\s*([^\n]+)', body)
    if pm: sku=pm.group(1).strip().split('₸')[0].strip()
    price=''
    pr=re.search(r'([\d\s]+)\s*₸', body)
    if pr: price=re.sub(r'\s+',' ',pr.group(1)).strip()+' ₸'

    stock=[]
    marker='Наличие в магазинах'
    if marker in body:
        part=body.split(marker,1)[1]
        # Typical rendered structure: Астана (Магазин №..., address) ... N шт.
        pairs=re.findall(r'Астана\s*\(([^)]+)\)\s+(\d+)\s*шт\.', part)
        for raw,n in pairs:
            addr=re.sub(r'^Магазин №\d+\s*,\s*','',raw).strip()
            addr=addr.replace('ул.','').strip()
            store=STORE_ALIASES.get(addr, addr)
            stock.append({'store':store,'address':addr,'qty':int(n)})
    # image
    img=''
    og=soup.find('meta', attrs={'property':'og:image'})
    if og: img=og.get('content','')
    return {'name':name,'sku':sku,'price':price,'url':url,'stock':stock,'image':img}

def main():
    products_by_url={}
    for page in range(1, MAX_PAGES+1):
        url=f'{BASE}/catalog/?PAGEN_1={page}&event=new'
        try:
            html=get(url)
        except Exception as e:
            print('catalog error',page,e); continue
        links=catalog_links(html)
        print('page',page,'links',len(links))
        for u in links:
            products_by_url.setdefault(u, None)
            if len(products_by_url)>=MAX_PRODUCTS: break
        if len(products_by_url)>=MAX_PRODUCTS: break
        time.sleep(DELAY)

    products=[]
    for i,u in enumerate(products_by_url,1):
        try:
            p=parse_product(u,get(u))
            if p: products.append(p)
            print(f'product {i}/{len(products_by_url)}', p['name'][:60] if p else 'skip')
        except Exception as e:
            print('product error',u,e)
        time.sleep(DELAY)

    data={'source':BASE,'city':'Астана','updatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),'products':products}
    with open(OUT,'w',encoding='utf-8') as f: json.dump(data,f,ensure_ascii=False,indent=2)
    print('saved',OUT,'products',len(products))

if __name__=='__main__': main()

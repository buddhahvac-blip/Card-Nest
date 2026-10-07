import {test,expect} from '@playwright/test';

const publicPages=[
  {path:'/',marker:'NestRune'},
  {path:'/season-one',marker:'369 guardians'},
  {path:'/play',marker:'Pick your flock'},
  {path:'/rune-dungeon',marker:'Descend into the Rune Dungeon'},
  {path:'/auth',marker:'Welcome to your nest'},
  {path:'/beta',marker:'Help a world'},
  {path:'/join',marker:'Help shape NestRune'}
];

for(const entry of publicPages){
  test(`${entry.path} renders without a server error`,async({page},testInfo)=>{
    const response=await page.goto(entry.path,{waitUntil:'domcontentloaded'});
    expect(response,`No document response for ${entry.path}`).not.toBeNull();
    expect(response!.status(),`${entry.path} returned ${response!.status()}`).toBeLessThan(500);
    await expect(page.locator('body')).toContainText(entry.marker,{timeout:15_000});
    if(testInfo.project.name.includes('mobile')){
      const overflow=await page.evaluate(
        ()=>document.documentElement.scrollWidth-document.documentElement.clientWidth
      );
      expect(overflow,'mobile layout should not overflow horizontally').toBeLessThanOrEqual(4);
    }
  });
}

test('authentication shell switches to account creation',async({page})=>{
  await page.goto('/auth');
  await page.getByRole('button',{name:'Create beta account'}).click();
  await expect(page.getByRole('heading',{name:'Join the First Flight.'})).toBeVisible();
  await expect(page.getByLabel('Display name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('Nest Battles can enter a practice match',async({page})=>{
  await page.goto('/play');
  const picks=page.locator('button.battle-picker');
  await expect(picks.first()).toBeVisible();
  await picks.nth(0).click();
  await picks.nth(1).click();
  await picks.nth(2).click();
  await page.getByRole('button',{name:/Start practice match/i}).click();
  await expect(page.getByText(/GARDEN ARENA/).first()).toBeVisible({timeout:10_000});
  await expect(page.getByRole('button',{name:/Quick Strike/i})).toBeVisible();
});

test('core navigation is present on game pages',async({page})=>{
  await page.goto('/play');
  const nav=page.getByRole('navigation',{name:'Game navigation'});
  await expect(nav.getByRole('link',{name:'Season 1'})).toBeVisible();
  await expect(nav.getByRole('link',{name:'Rune Dungeon'})).toBeVisible();
});

const token = 'EAAO2DuYElTABSIB8C9OhAHcZB0AqvzoQISMUmpUSxkPaRmLpBXDCanFk7MUBEYtnAuMz3r5kZCctoaC3lem1CSRehlqFBGkb5JcZCx8fEKkxXYRl0q8lS4erxrnmQcc19Spbbn5kOZAECZA6SUXtR5ZCRjvXQZC2eS1ZCGbFQRbPh1hKUitJdBnsza25mENN7BfmUVqIvd7MhQDV3SChrZBzyHFYe3fNBx6kUFiJpmWqiKJFXu1z2ClgaWSTZCM4rymEBTjIysaOgC85kZD';

async function checkToken() {
  try {
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}&fields=id,name`);
    const me = await meRes.json();
    console.log('User:', me);

    const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`);
    const accounts = await accountsRes.json();
    console.log('Pages:', JSON.stringify(accounts, null, 2));
  } catch (e) {
    console.error(e);
  }
}
checkToken();

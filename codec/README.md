# Codec utilities (examples)

Decode a transaction event:

```
node ./decodeEvent.js --abi=example.abi.json --event=deposit --api=https://testnet-api.multiversx.com --tx=532087e5021c9ab8be8a4db5ad843cfe0610761f6334d9693b3765992fd05f67
```

Decode a value of a custom type (a structure):

```
node ./decodeCustomType.js --abi=example.abi.json --type=DepositEvent --data=00000000000003db000000
```

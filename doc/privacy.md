# Privacy Flow

status: initial draft


### Browser

Prerequisites:

- receives addresses via in-page data or via ajax request (addresses can be cached in localStorage or equivalent)
- browser is onboarded (contract and server knows its address/publicKey - see `onboarding`)

Flow:

- creates sharedSecret
- encrypts data with sharedSecret (dataEnc is returned)
- signs message via ecccrypto (message: `"contractFunctionName, contractArguments, addresses"` - data is json payload for example serialized form data)
- creates request to the server - passes `"message, signature"` (synchronous POST request for form submit or POST ajax call via `fetch`)


### Server

`b-privacy-rb`
`b-privacy-js-server` (TODO)

Prerequisites:

- has a post endpoint to receive synchronous or ajax calls (sketched in the demo, not implemented to be reusable)

Flow:

- receives POST request
- encrypts sharedSecret for every node (server) address
- calls contract function (`signedMessage, data, encryptedSecrets, addresses` + extra parameters)

### Contract

- sample contract can be found in ...

contract receives all the arguments and:

- checks that the clientAddress (owner address) matches
- checks that hash of the signed message matches the data payload
- extra checks and logic (saves data, and other parameters)


### Onboarding

- see nuggets repos for onboarding (`nuggets-truffle`, `nuggets-dummyclient`) - we need to register the address of the client (`clientAddress`) in the contract.

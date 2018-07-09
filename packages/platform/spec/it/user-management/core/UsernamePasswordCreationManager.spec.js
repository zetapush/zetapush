// const {
//   UsernamePasswordAccountCreationManager,
//   StaticAccountStatusProvider,
// } = require('../../../../lib/user-management/standard-user-workflow/core');
// const {
//   UsernamePasswordAccountCreationManagerConfigurer
// } = require('../../../../lib/user-management/standard-user-workflow/configurer');
// const {
//   TimestampBasedUuidGenerator,
// } = require('../../../../lib/common/core');
// const {
//   Simple,
// } = require('../../../../lib/authentication');

// describe(`UsernamePasswordAccountCreationManager`, () => {
//   let sandbox

//   beforeEach(() => {
//     sandbox = createSandbox()
//     // TODO: create configurer + inject services
//     const creationManager = new UsernamePasswordAccountCreationManagerConfigurer()
//       .uuid()
//         .generator(TimestampBasedUuidGenerator)
//         .and()
//       .status()
//         .value()
//         .and()
//       .build()
//   })

//   it(`configured with
//       - uuid = 42
//       - account status = 'WAITING_FOR_CONFIRMATION'
//       - userService that creates account successfully
//       - no account details provider
//      should return a profile with:
//       - accountId = 42
//       - accountStatus = 'WAITING_FOR_CONFIRMATION'
//       - userProfile = {firstname: 'Odile', lastname: 'DERAY'}`, async () => {
//     // GIVEN
//     uuidGenerator.generate.and.returnValue({value: 42})
//     accountStatusProvider.getStatus.and.returnValue(AccountStatus.waitingConfirmation)
//         // TODO: real value from service
//     userService.createUser.and.returnValue()
//     // WHEN
//     const account = await creationManager.signup({
//       username: 'odile.deray',
//       password: '123456',
//       profile: {
//         firstname: 'Odile',
//         lastname: 'DERAY'
//       }
//     })
//     // THEN
//     expect(account.accountId).toBe(42)
//     expect(account.accountStatus).toBe(AccountStatus.waitingConfirmation)
//     expect(account.userProfile).toEqual({
//       firstname: 'Odile',
//       lastname: 'DERAY'
//     })
//   });

//   it(`configured with
//       - uuid = 42
//       - account status = 'WAITING_FOR_CONFIRMATION'
//       - userService that fails due to account already exists
//       - no account details provider
//      should fail with exception`, async () => {
//     // GIVEN
//     uuidGenerator.generate.and.returnValue({value: 42})
//     accountStatusProvider.getStatus.and.returnValue(AccountStatus.waitingConfirmation)
//     // TODO: real error from service
//     userService.createUser.and.throwError(new Error("ALREADY_EXISTS"))
//     // WHEN/THEN
//     expect(async () => {
//       const account = await creationManager.signup({
//         username: 'odile.deray',
//         password: '123456',
//         profile: {
//           firstname: 'Odile',
//           lastname: 'DERAY'
//         }
//       })
//     }).toThrowError(UsernameAlreadyUsedError, 'Username "odile.deray" is already used')
//   });
// });

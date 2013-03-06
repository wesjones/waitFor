# WaitFor

WaitFor is a an additional API for Testacular's Angular Scenario Runner.

## Why do we need this additional API.

When using Testacular's Angular Scenario Runner I constantly ran into this scenario.

```bash
it("Should click on the button", function() {
	sleep(1);
	element('.myButton', 'Click My Button').click();
});
```

The reason I kept running into this scenario would be transitions, or waiting for services to load, or any number of other reasons that the element was not ready yet.

So wouldn't it be nice if you could do this.

```bash
it("Should click on the button", function() {
	waitFor('.myButton', 'Click My Button').click();
});
```

Then as soon as the button is available which it could be in 0.1 seconds instead of 1 second and the waitFor would exectute as soon as it is ready.
This process completely replaces the "element" api so that you can use waitFor.

## Features
Completely replace element api so we don't have to use sleep any more.


Have the optional 3rd parameter that we can pass that will tell it how long to wait (defaut is 10 seconds) before it times out.

```bash
it("Should click on the button", function() {
	waitFor('.myButton', 'Click My Button', 60).click(); // make it wait 60 seconds before timing out because our services are VERY slow.
});
```


Have the option of some addional features like focus, blur, etc... and be able to chain them. You can chain on functions that don't return a value.

```bash
it("Should click on the button", function() {
	waitFor('.myInput', 'My Name Input').focus().val("Wes");
	waitFor('.myInput', 'My Name Input to blur').blur();
});
```

## How to use it.
In order to use this you just need to include this file in your testacular.config.js file just after you angular scenario runner.
```bash
// list of files / patterns to load in the browser
files = [
    ANGULAR_SCENARIO,
    ANGULAR_SCENARIO_ADAPTER,
    'tests/shared/angular-scenario-waitFor.js',
    'tests/shared/e2eSetup.js'
];
```
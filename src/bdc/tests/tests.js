const webdriver = require('selenium-webdriver'),
    By = webdriver.By, // useful Locator utility to describe a query for a WebElement
    until = webdriver.until, // async wait
    logging = webdriver.logging; // logging

const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .usingServer('http://eusko_selenium:4444/wd/hub')
    .build();

describe('login form', function() {
    this.timeout(100000000);

    before((done) => {
        driver.navigate().to('http://bdc:8000/login')
        .then(() => done())
    });

    it('autocompletes the fields & submit the form', (done) => {
        var username = driver.findElement(By.id('username'))
        var password = driver.findElement(By.id('password'))
        var button = driver.findElement(By.className('btn-success'))

        username.sendKeys('B001')
        password.sendKeys('B001')

        driver.wait(until.elementIsEnabled(button))

        button.click()
        console.log(driver.manage().logs().get("browser"))
    });

    after(() => driver.quit());
});
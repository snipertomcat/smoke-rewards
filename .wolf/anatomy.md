# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-05T03:25:45.298Z
> Files: 524 tracked | Anatomy hits: 0 | Misses: 0

## ../../.claude/projects/-Users-jesse-Projects-smoke-rewards/memory/

- `MEMORY.md` — Memory Index (~54 tok)
- `project_billing.md` (~369 tok)
- `project_overview.md` (~217 tok)

## ./

- `.gitignore` — Git ignore rules (~123 tok)
- `CLAUDE.md` — OpenWolf (~120 tok)

## .claude/

- `settings.json` (~441 tok)
- `settings.local.json` — Declares f (~308 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## backend/

- `.editorconfig` — Editor configuration (~68 tok)
- `.gitattributes` — Git attributes (~50 tok)
- `.gitignore` — Git ignore rules (~76 tok)
- `artisan` — Laravel CLI entry point (~114 tok)
- `composer.json` — PHP package manifest (~835 tok)
- `package.json` — Node.js package manifest (~119 tok)
- `phpunit.xml` (~378 tok)
- `README.md` — Project documentation (~978 tok)
- `vite.config.js` — Vite build configuration (~125 tok)

## backend/app/Http/Controllers/

- `Controller.php` — Controller: Controller (~36 tok)

## backend/app/Http/Controllers/Api/

- `AuthController.php` — login, logout, me (~526 tok)
- `CustomerController.php` — index, store, show, update, destroy + 1 more (~653 tok)
- `PointTransactionController.php` — index, forCustomer, adjust (~499 tok)
- `PurchaseController.php` — forCustomer, store (~333 tok)
- `SettingsController.php` — show, update (~467 tok)
- `StaffController.php` — index, stats, store, update, destroy (~1444 tok)
- `StatisticsController.php` — index, topCustomers, purchaseTrend (~273 tok)
- `StripeWebhookController.php` — handle (~1154 tok)
- `TenantLogoController.php` — store, destroy (~359 tok)

## backend/app/Http/Controllers/Api/Admin/

- `AdminBillingController.php` — List all subscriptions system-wide. (~837 tok)
- `AdminCustomerController.php` — index, show, destroy (~405 tok)
- `AdminStatsController.php` — index, purchaseTrend, topTenants, recentActivity (~932 tok)
- `AdminTenantController.php` — index, store, show, update, destroy (~862 tok)
- `AdminUserController.php` — index, store, update, destroy (~644 tok)

## backend/app/Http/Controllers/Api/Salesman/

- `SalesmanBillingController.php` — List all subscriptions for tenants, optionally filtered by tenant. (~2436 tok)
- `SalesmanCustomerController.php` — index, show (~364 tok)
- `SalesmanShopController.php` — index, store, show, update, destroy + 1 more (~1173 tok)
- `SalesmanStatsController.php` — index, purchaseTrend, topShops, shopStats (~1327 tok)

## backend/app/Http/Middleware/

- `EnsureIsAdmin.php` — EnsureIsAdmin: handle (~112 tok)
- `EnsureSalesman.php` — EnsureSalesman: handle (~107 tok)
- `EnsureSuperAdmin.php` — EnsureSuperAdmin: handle (~108 tok)
- `EnsureTenantIsActive.php` — EnsureTenantIsActive: handle (~188 tok)
- `SetTenantScope.php` — Query scope: SetTenantScope (~104 tok)

## backend/app/Http/Requests/Auth/

- `LoginRequest.php` — Form validation: LoginRequest (~100 tok)

## backend/app/Http/Requests/Customer/

- `StoreCustomerRequest.php` — Form validation: StoreCustomerRequest (~385 tok)
- `UpdateCustomerRequest.php` — Form validation: UpdateCustomerRequest (~389 tok)

## backend/app/Http/Requests/PointTransaction/

- `AdjustPointsRequest.php` — Form validation: AdjustPointsRequest (~132 tok)

## backend/app/Http/Requests/Purchase/

- `StorePurchaseRequest.php` — Form validation: StorePurchaseRequest (~127 tok)

## backend/app/Http/Resources/

- `CustomerResource.php` — API resource: CustomerResource (~249 tok)
- `PointTransactionResource.php` — API resource: PointTransactionResource (~271 tok)
- `PurchaseResource.php` — API resource: PurchaseResource (~209 tok)

## backend/app/Models/

- `BillingTransaction.php` — Model — 9 fields, 4 casts, 2 rels (~219 tok)
- `Customer.php` — Model — 9 fields, 4 casts, 3 rels (~343 tok)
- `PointTransaction.php` — Model — 9 fields, 4 casts, 3 rels (~284 tok)
- `Purchase.php` — Model — 7 fields, 6 casts, 4 rels (~338 tok)
- `Subscription.php` — Model — 11 fields, 8 casts, 3 rels (~321 tok)
- `Tenant.php` — Get the points-per-dollar setting for this tenant, (~428 tok)
- `User.php` — Model — 5 fields, 1 rels (~335 tok)

## backend/app/Policies/

- `CustomerPolicy.php` — Authorization policy: CustomerPolicy (~184 tok)
- `PointTransactionPolicy.php` — Authorization policy: PointTransactionPolicy (~114 tok)
- `PurchasePolicy.php` — Authorization policy: PurchasePolicy (~106 tok)

## backend/app/Providers/

- `AppServiceProvider.php` — Register any application services. (~111 tok)
- `RepositoryServiceProvider.php` — Service provider: RepositoryServiceProvider (~456 tok)

## backend/app/Repositories/

- `CustomerRepository.php` — CustomerRepository: paginate, findById, findByRfid, create + 2 more (~403 tok)
- `PointTransactionRepository.php` — PointTransactionRepository: forCustomer, forTenant, create, adjustCustomerBalance (~546 tok)
- `PurchaseRepository.php` — PurchaseRepository: forCustomer, create (~175 tok)
- `StatisticsRepository.php` — StatisticsRepository: getTotalCustomers, getTotalPointsIssued, getTotalPointsOutstanding, getPurchasesThisMonth + 3 more (~582 tok)

## backend/app/Repositories/Contracts/

- `CustomerRepositoryInterface.php` — Interface: CustomerRepositoryInterface (6 methods) (~148 tok)
- `PointTransactionRepositoryInterface.php` — Atomically update the customer's points_balance by a delta (positive or negative). (~181 tok)
- `PurchaseRepositoryInterface.php` — Interface: PurchaseRepositoryInterface (2 methods) (~92 tok)
- `StatisticsRepositoryInterface.php` — Interface: StatisticsRepositoryInterface (7 methods) (~138 tok)

## backend/app/Scopes/

- `TenantScope.php` — Query scope: TenantScope (~128 tok)

## backend/app/Services/

- `CustomerService.php` — CustomerService: list, register, update, delete + 1 more (~418 tok)
- `PointsService.php` — PointsService: listForCustomer, listForTenant, earnFromPurchase, adjust (~788 tok)
- `PurchaseService.php` — PurchaseService: listForCustomer, record (~528 tok)
- `StatisticsService.php` — StatisticsService: getSummary, getTopCustomers, getPurchaseTrend (~315 tok)

## backend/app/Services/Contracts/

- `CustomerServiceInterface.php` — Interface: CustomerServiceInterface (5 methods) (~136 tok)
- `PointsServiceInterface.php` — Interface: PointsServiceInterface (4 methods) (~186 tok)
- `PurchaseServiceInterface.php` — Interface: PurchaseServiceInterface (2 methods) (~106 tok)
- `StatisticsServiceInterface.php` — Interface: StatisticsServiceInterface (3 methods) (~67 tok)

## backend/bootstrap/

- `app.php` (~166 tok)
- `providers.php` (~24 tok)

## backend/bootstrap/cache/

- `.gitignore` — Git ignore rules (~4 tok)
- `packages.php` (~256 tok)
- `services.php` (~5867 tok)

## backend/config/

- `app.php` (~1140 tok)
- `auth.php` (~1078 tok)
- `cache.php` (~983 tok)
- `database.php` (~1862 tok)
- `filesystems.php` (~676 tok)
- `logging.php` (~1158 tok)
- `mail.php` — Declares of (~969 tok)
- `queue.php` (~1120 tok)
- `rewards.php` (~103 tok)
- `services.php` — Declares of (~330 tok)
- `session.php` (~2093 tok)

## backend/database/

- `.gitignore` — Git ignore rules (~3 tok)

## backend/database/factories/

- `UserFactory.php` — Model factory: UserFactory (~279 tok)

## backend/database/migrations/

- `0001_01_01_000001_create_cache_table.php` — Run the migrations. (~232 tok)
- `0001_01_01_000002_create_jobs_table.php` — Run the migrations. (~484 tok)
- `2024_01_01_000000_create_tenants_table.php` — Migration: create tenants table (~190 tok)
- `2024_01_01_000001_create_users_table.php` — Migration: create users table (~237 tok)
- `2024_01_01_000002_create_customers_table.php` — Migration: create customers table (~317 tok)
- `2024_01_01_000003_create_purchases_table.php` — Migration: create purchases table (~280 tok)
- `2024_01_01_000004_create_point_transactions_table.php` — Migration: create point_transactions table (~315 tok)
- `2026_03_16_000000_update_users_for_super_admin.php` — Migration: alter users table (~225 tok)
- `2026_03_16_223357_create_personal_access_tokens_table.php` — Run the migrations. (~231 tok)
- `2026_03_17_000001_add_registered_by_to_customers.php` — Migration: alter customers table (~196 tok)
- `2026_03_20_000001_add_logo_url_to_tenants.php` — Migration: alter tenants table (~141 tok)
- `2026_04_02_000001_add_salesman_to_users_role_enum.php` — Database migration (~143 tok)
- `2026_04_02_200000_add_stripe_customer_id_to_tenants.php` — Migration: alter tenants table (~147 tok)
- `2026_04_02_200001_create_subscriptions_table.php` — Migration: create subscriptions table (~338 tok)
- `2026_04_02_200002_create_billing_transactions_table.php` — Migration: create billing_transactions table (~290 tok)

## backend/database/seeders/

- `CustomerSeeder.php` — Database seeder: CustomerSeeder (~469 tok)
- `DatabaseSeeder.php` — Database seeder: DatabaseSeeder (~87 tok)
- `TenantSeeder.php` — Database seeder: TenantSeeder (~417 tok)
- `TransactionSeeder.php` — Database seeder: TransactionSeeder (~1037 tok)
- `UserSeeder.php` — Database seeder: UserSeeder (~449 tok)

## backend/public/

- `.htaccess` — Apache configuration (~198 tok)
- `index.php` (~145 tok)
- `robots.txt` (~6 tok)

## backend/resources/css/

- `app.css` — /*.blade.php'; (~112 tok)

## backend/resources/js/

- `app.js` (~7 tok)
- `bootstrap.js` (~37 tok)

## backend/resources/views/

- `welcome.blade.php` — Blade: welcome (~22019 tok)

## backend/routes/

- `api.php` (~2059 tok)
- `console.php` (~56 tok)
- `web.php` (~29 tok)

## backend/storage/app/

- `.gitignore` — Git ignore rules (~9 tok)

## backend/storage/app/private/

- `.gitignore` — Git ignore rules (~4 tok)

## backend/storage/app/public/

- `.gitignore` — Git ignore rules (~4 tok)

## backend/storage/app/public/logos/3/

- `6CJyvYbxArIyXQ1eVXdS7Q0QyZNTa1Dl8H7A41s8.webp` (~3973 tok)

## backend/storage/framework/

- `.gitignore` — Git ignore rules (~32 tok)

## backend/storage/framework/cache/

- `.gitignore` — Git ignore rules (~6 tok)

## backend/storage/framework/cache/data/

- `.gitignore` — Git ignore rules (~4 tok)

## backend/storage/framework/sessions/

- `.gitignore` — Git ignore rules (~4 tok)
- `j6tKz1kqA3iyaPsLy24idVXYgIcN0VjT0cLl0qWs` (~52 tok)
- `kKVsvReGfMIav5didm0qQLY8aaJg3yfIqZGr8qIG` (~52 tok)

## backend/storage/framework/testing/

- `.gitignore` — Git ignore rules (~4 tok)

## backend/storage/framework/views/

- `.gitignore` — Git ignore rules (~4 tok)
- `04239e68dc32ed7b33f59499199164c7.php` — PATH /Users/jesse/Projects/smoke-rewards/backend/vendor/laravel/framework/src/Illuminate/Foundation/Exceptions/views/404.blade.php ENDPATH**/ ?> (~118 tok)
- `3e38b660275a9d69d9bd79c9c734b225.php` — PATH /Users/jesse/Projects/smoke-rewards/backend/vendor/laravel/framework/src/Illuminate/Foundation/Configuration/../resources/health-up.blade.php ... (~604 tok)
- `e6bb090ad448e134f4f76192962a0930.php` — PATH /Users/jesse/Projects/smoke-rewards/backend/vendor/laravel/framework/src/Illuminate/Foundation/Exceptions/views/minimal.blade.php ENDPATH**/ ?> (~1848 tok)
- `f6a15f21661c090804916e07c4231230.php` (~22088 tok)

## backend/storage/logs/

- `.gitignore` — Git ignore rules (~4 tok)

## backend/tests/

- `TestCase.php` — Declares TestCase (~38 tok)

## backend/tests/Feature/

- `ExampleTest.php` — A basic test example. (~96 tok)

## backend/tests/Unit/

- `ExampleTest.php` — A basic test example. (~65 tok)

## backend/vendor/

- `autoload.php` — autoload.php @generated by Composer (~200 tok)

## backend/vendor/bin/

- `carbon` — Proxy PHP file generated by Composer (~888 tok)
- `patch-type-declarations` — Proxy PHP file generated by Composer (~916 tok)
- `php-parse` — Proxy PHP file generated by Composer (~893 tok)
- `phpunit` — Proxy PHP file generated by Composer (~984 tok)
- `pint` — Proxy PHP file generated by Composer (~888 tok)
- `psysh` — Proxy PHP file generated by Composer (~884 tok)
- `sail` — Support bash to support `source` with fallback on $0 if this does not run with bash (~254 tok)
- `var-dump-server` — Proxy PHP file generated by Composer (~908 tok)
- `yaml-lint` — Proxy PHP file generated by Composer (~898 tok)

## backend/vendor/brick/math/

- `CHANGELOG.md` — Change log (~6389 tok)
- `composer.json` — PHP package manifest (~234 tok)
- `LICENSE` — Project license (~291 tok)

## backend/vendor/brick/math/src/

- `BigDecimal.php` — An arbitrarily large decimal number. (~7764 tok)
- `BigInteger.php` — An arbitrarily large integer number. (~11510 tok)
- `BigNumber.php` — Base class for arbitrary-precision numbers. (~5854 tok)
- `BigRational.php` — An arbitrarily large rational number. (~4955 tok)
- `RoundingMode.php` — Specifies rounding behavior by defining how discarded digits affect the returned result when an exact value cannot (~1147 tok)

## backend/vendor/brick/math/src/Exception/

- `DivisionByZeroException.php` — Exception thrown when a division by zero occurs. (~193 tok)
- `IntegerOverflowException.php` — Exception thrown when an integer overflow occurs. (~160 tok)
- `MathException.php` — Base class for all math exceptions. (~50 tok)
- `NegativeNumberException.php` — Exception thrown when attempting to perform an unsupported operation, such as a square root, on a negative number. (~68 tok)
- `NumberFormatException.php` — Exception thrown when attempting to create a number from a string with an invalid format. (~332 tok)
- `RoundingNecessaryException.php` — Exception thrown when a number cannot be represented at the requested scale without rounding. (~123 tok)

## backend/vendor/brick/math/src/Internal/

- `Calculator.php` — Performs basic operations on arbitrary size integers. (~4996 tok)
- `CalculatorRegistry.php` — Stores the current Calculator instance used by BigNumber classes. (~504 tok)

## backend/vendor/brick/math/src/Internal/Calculator/

- `BcMathCalculator.php` — Calculator implementation built around the bcmath library. (~454 tok)
- `GmpCalculator.php` — Calculator implementation built around the GMP library. (~835 tok)
- `NativeCalculator.php` — Calculator implementation using only native PHP code. (~3759 tok)

## backend/vendor/carbonphp/carbon-doctrine-types/

- `composer.json` — PHP package manifest (~226 tok)
- `LICENSE` — Project license (~284 tok)
- `README.md` — Project documentation (~130 tok)

## backend/vendor/carbonphp/carbon-doctrine-types/src/Carbon/Doctrine/

- `CarbonDoctrineType.php` — Interface: CarbonDoctrineType (3 methods) (~106 tok)
- `CarbonImmutableType.php` — Declares CarbonImmutableType (~41 tok)
- `CarbonType.php` — Declares CarbonType (~36 tok)
- `CarbonTypeConverter.php` — Trait: CarbonTypeConverter (~860 tok)
- `DateTimeDefaultPrecision.php` — Change the default Doctrine datetime and datetime_immutable precision. (~152 tok)
- `DateTimeImmutableType.php` — DateTimeImmutableType: use CarbonTypeConverter; (~209 tok)
- `DateTimeType.php` — DateTimeType: use CarbonTypeConverter; (~148 tok)

## backend/vendor/composer/

- `autoload_classmap.php` — autoload_classmap.php @generated by Composer (~238533 tok)
- `autoload_files.php` — autoload_files.php @generated by Composer (~1024 tok)
- `autoload_namespaces.php` — autoload_namespaces.php @generated by Composer (~38 tok)
- `autoload_psr4.php` — autoload_psr4.php @generated by Composer (~1927 tok)
- `autoload_real.php` — autoload_real.php @generated by Composer (~446 tok)
- `autoload_static.php` — autoload_static.php @generated by Composer (~260710 tok)
- `ClassLoader.php` — ClassLoader implements a PSR-0, PSR-4 and classmap class loader. (~4368 tok)
- `installed.json` (~94442 tok)
- `installed.php` (~13865 tok)
- `InstalledVersions.php` — This class is copied in every Composer installed project and available to all (~4639 tok)
- `LICENSE` — Project license (~286 tok)
- `platform_check.php` — platform_check.php @generated by Composer (~245 tok)

## backend/vendor/dflydev/dot-access-data/

- `CHANGELOG.md` — Change log (~627 tok)
- `composer.json` — PHP package manifest (~513 tok)
- `LICENSE` — Project license (~286 tok)
- `README.md` — Project documentation (~978 tok)

## backend/vendor/dflydev/dot-access-data/src/

- `Data.php` — Data: {@inheritdoc}, {@inheritdoc}, {@inheritdoc}, {@inheritdoc} + 9 more (~1798 tok)
- `DataInterface.php` — Append a value to a key (assumes key refers to an array value) (~936 tok)
- `Util.php` — Test if array is an associative array (~514 tok)

## backend/vendor/dflydev/dot-access-data/src/Exception/

- `DataException.php` — Base runtime exception type thrown by this library (~111 tok)
- `InvalidPathException.php` — Thrown when trying to access an invalid path in the data array (~115 tok)
- `MissingPathException.php` — Thrown when trying to access a path that does not exist (~207 tok)

## backend/vendor/doctrine/inflector/

- `composer.json` — PHP package manifest (~512 tok)
- `LICENSE` — Project license (~284 tok)
- `README.md` — Project documentation (~132 tok)

## backend/vendor/doctrine/inflector/docs/en/

- `index.rst` (~1638 tok)

## backend/vendor/doctrine/inflector/src/

- `CachedWordInflector.php` — CachedWordInflector: inflect (~137 tok)
- `GenericLanguageInflectorFactory.php` — Model factory: GenericLanguageInflectorFactory (~447 tok)
- `Inflector.php` — Inflector: private $singularizer;, Converts a word into the format for a Doctrine cla, Camelizes a word. This uses the classify() method , Uppercas... (~3376 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~451 tok)
- `Language.php` — Declares Language (~141 tok)
- `LanguageInflectorFactory.php` — Applies custom rules for singularisation (~215 tok)
- `NoopWordInflector.php` — NoopWordInflector: inflect (~54 tok)
- `RulesetInflector.php` — Inflects based on multiple rulesets. (~362 tok)
- `WordInflector.php` — Interface: WordInflector (1 methods) (~39 tok)

## backend/vendor/doctrine/inflector/src/Rules/

- `Pattern.php` — Pattern: getPattern, getRegex, matches (~211 tok)
- `Patterns.php` — Patterns: matches (~161 tok)
- `Ruleset.php` — Ruleset: getRegular, getUninflected, getIrregular (~208 tok)
- `Substitution.php` — Substitution: getFrom, getTo (~121 tok)
- `Substitutions.php` — Substitutions: getFlippedSubstitutions, inflect (~366 tok)
- `Transformation.php` — Transformation: getPattern, getReplacement, inflect (~211 tok)
- `Transformations.php` — Transformations: inflect (~173 tok)
- `Word.php` — Word: getWord (~79 tok)

## backend/vendor/doctrine/inflector/src/Rules/English/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~3184 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~123 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~234 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~1745 tok)

## backend/vendor/doctrine/inflector/src/Rules/Esperanto/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~197 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~124 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~234 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~142 tok)

## backend/vendor/doctrine/inflector/src/Rules/French/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~501 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~123 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~233 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~160 tok)

## backend/vendor/doctrine/inflector/src/Rules/Italian/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~2235 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~123 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~234 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~459 tok)

## backend/vendor/doctrine/inflector/src/Rules/NorwegianBokmal/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~252 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~126 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~236 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~164 tok)

## backend/vendor/doctrine/inflector/src/Rules/Portuguese/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~1487 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~124 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~234 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~183 tok)

## backend/vendor/doctrine/inflector/src/Rules/Spanish/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~490 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~123 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~234 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~164 tok)

## backend/vendor/doctrine/inflector/src/Rules/Turkish/

- `Inflectible.php` — Inflectible: getSingular, getPlural, getIrregular (~266 tok)
- `InflectorFactory.php` — Model factory: InflectorFactory (~123 tok)
- `Rules.php` — Rules: getSingularRuleset, getPluralRuleset (~234 tok)
- `Uninflected.php` — Uninflected: getSingular, getPlural (~164 tok)

## backend/vendor/doctrine/lexer/

- `composer.json` — PHP package manifest (~405 tok)
- `LICENSE` — Project license (~284 tok)
- `README.md` — Project documentation (~92 tok)
- `UPGRADE.md` — Upgrade to 3.0.0 (~241 tok)

## backend/vendor/doctrine/lexer/src/

- `AbstractLexer.php` — Base class for writing simple lexers, i.e. for creating small DSLs. (~1986 tok)
- `Token.php` — Token: isA (~273 tok)

## backend/vendor/dragonmantank/cron-expression/

- `CHANGELOG.md` — Change log (~1636 tok)
- `composer.json` — PHP package manifest (~364 tok)
- `LICENSE` — Project license (~306 tok)
- `README.md` — Project documentation (~1451 tok)

## backend/vendor/dragonmantank/cron-expression/src/Cron/

- `AbstractField.php` — Abstract CRON expression field. (~2639 tok)
- `CronExpression.php` — CRON expression parser that can determine whether or not a CRON expression is (~5595 tok)
- `DayOfMonthField.php` — Day of month field.  Allows: * , / - ? L W. (~1303 tok)
- `DayOfWeekField.php` — Day of week field.  Allows: * / , - ? L #. (~1540 tok)
- `FieldFactory.php` — CRON field factory implementing a flyweight factory. (~381 tok)
- `FieldFactoryInterface.php` — Interface: FieldFactoryInterface (1 methods) (~33 tok)
- `FieldInterface.php` — CRON field interface. (~354 tok)
- `HoursField.php` — Hours field.  Allows: * , / -. (~1980 tok)
- `MinutesField.php` — Minutes field.  Allows: * , / -. (~721 tok)
- `MonthField.php` — Month field.  Allows: * , / -. (~357 tok)

## backend/vendor/egulias/email-validator/

- `composer.json` — PHP package manifest (~268 tok)
- `CONTRIBUTING.md` — Contributing (~1628 tok)
- `LICENSE` — Project license (~286 tok)

## backend/vendor/egulias/email-validator/src/

- `EmailLexer.php` — EmailLexer: class EmailLexer extends AbstractLexer, moveNext, Retrieve token type. Also processes the token valu, getAccumulatedValues + 3 more (~2320 tok)
- `EmailParser.php` — EmailParser: parse, getDomainPart, getLocalPart (~634 tok)
- `EmailValidator.php` — EmailValidator: private $lexer;, hasWarnings, getWarnings, getError (~330 tok)
- `MessageIDParser.php` — MessageIDParser: parse, getLeftPart, getRightPart (~627 tok)
- `Parser.php` — Parser: protected $warnings = []; (~477 tok)

## backend/vendor/egulias/email-validator/src/Parser/

- `Comment.php` — Comment: parse (~842 tok)
- `DomainLiteral.php` — DomainLiteral: parse, checkIPV6Tag, convertIPv4ToIPv6 (~1912 tok)
- `DomainPart.php` — DomainPart: parse, domainPart (~2876 tok)
- `DoubleQuote.php` — DoubleQuote: parse (~854 tok)
- `FoldingWhiteSpace.php` — FoldingWhiteSpace: parse (~746 tok)
- `IDLeftPart.php` — IDLeftPart: parseComments (~103 tok)
- `IDRightPart.php` — IDRightPart: validateTokens (~260 tok)
- `LocalPart.php` — LocalPart: parse, localPart (~1453 tok)
- `PartParser.php` — PartParser: protected $warnings = []; (~411 tok)

## backend/vendor/egulias/email-validator/src/Parser/CommentStrategy/

- `CommentStrategy.php` — Return "true" to continue, "false" to exit (~140 tok)
- `DomainComment.php` — DomainComment: exitCondition, endOfLoopValidations, getWarnings (~280 tok)
- `LocalComment.php` — LocalComment: exitCondition, endOfLoopValidations, getWarnings (~299 tok)

## backend/vendor/egulias/email-validator/src/Result/

- `InvalidEmail.php` — InvalidEmail: isValid, isInvalid, description, code + 1 more (~225 tok)
- `MultipleErrors.php` — MultipleErrors: class MultipleErrors extends InvalidEmail, reason, description, code (~285 tok)
- `Result.php` — Is validation result valid? (~141 tok)
- `SpoofEmail.php` — Declares SpoofEmail (~82 tok)
- `ValidEmail.php` — ValidEmail: isValid, isInvalid, description, code (~102 tok)

## backend/vendor/egulias/email-validator/src/Result/Reason/

- `AtextAfterCFWS.php` — AtextAfterCFWS: code, description (~70 tok)
- `CharNotAllowed.php` — CharNotAllowed: code, description (~69 tok)
- `CommaInDomain.php` — CommaInDomain: code, description (~74 tok)
- `CommentsInIDRight.php` — CommentsInIDRight: code, description (~78 tok)
- `ConsecutiveAt.php` — ConsecutiveAt: code, description (~70 tok)
- `ConsecutiveDot.php` — ConsecutiveDot: code, description (~70 tok)
- `CRLFAtTheEnd.php` — CRLFAtTheEnd: code, description (~88 tok)
- `CRLFX2.php` — CRLFX2: code, description (~69 tok)
- `CRNoLF.php` — CRNoLF: code, description (~67 tok)
- `DetailedReason.php` — Declares DetailedReason (~68 tok)
- `DomainAcceptsNoMail.php` — DomainAcceptsNoMail: code, description (~76 tok)
- `DomainHyphened.php` — DomainHyphened: code, description (~72 tok)
- `DomainTooLong.php` — DomainTooLong: code, description (~74 tok)
- `DotAtEnd.php` — DotAtEnd: code, description (~66 tok)
- `DotAtStart.php` — DotAtStart: code, description (~68 tok)
- `EmptyReason.php` — EmptyReason: code, description (~66 tok)
- `ExceptionFound.php` — ExceptionFound: code, description (~119 tok)
- `ExpectingATEXT.php` — ExpectingATEXT: code, description (~86 tok)
- `ExpectingCTEXT.php` — ExpectingCTEXT: code, description (~68 tok)
- `ExpectingDomainLiteralClose.php` — ExpectingDomainLiteralClose: code, description (~80 tok)
- `ExpectingDTEXT.php` — ExpectingDTEXT: code, description (~68 tok)
- `LabelTooLong.php` — LabelTooLong: code, description (~75 tok)
- `LocalOrReservedDomain.php` — LocalOrReservedDomain: code, description (~79 tok)
- `NoDNSRecord.php` — NoDNSRecord: code, description (~75 tok)
- `NoDomainPart.php` — NoDomainPart: code, description (~69 tok)
- `NoLocalPart.php` — NoLocalPart: code, description (~67 tok)
- `Reason.php` — Code for user land to act upon; (~76 tok)
- `RFCWarnings.php` — RFCWarnings: code, description (~72 tok)
- `SpoofEmail.php` — SpoofEmail: code, description (~80 tok)
- `UnableToGetDNSRecord.php` — Used on SERVFAIL, TIMEOUT or other runtime and network errors (~95 tok)
- `UnclosedComment.php` — UnclosedComment: code, description (~72 tok)
- `UnclosedQuotedString.php` — UnclosedQuotedString: code, description (~72 tok)
- `UnOpenedComment.php` — UnOpenedComment: code, description (~87 tok)
- `UnusualElements.php` — UnusualElements: code, description (~135 tok)

## backend/vendor/egulias/email-validator/src/Validation/

- `DNSCheckValidation.php` — Reserved Top Level DNS Names (https://tools.ietf.org/html/rfc2606#section-2), (~1544 tok)
- `DNSGetRecordWrapper.php` — DNSGetRecordWrapper: getRecords (~230 tok)
- `DNSRecords.php` — DNSRecords: getRecords, withError (~136 tok)
- `EmailValidation.php` — Returns true if the given email is valid. (~210 tok)
- `MessageIDValidation.php` — MessageIDValidation: private $warnings = [];, getError (~347 tok)
- `MultipleValidationWithAnd.php` — If one of validations fails, the remaining validations will be skipped. (~753 tok)
- `NoRFCWarningsValidation.php` — NoRFCWarningsValidation: private $error;, {@inheritdoc} (~226 tok)
- `RFCValidation.php` — RFCValidation: private array $warnings = []; (~345 tok)

## backend/vendor/egulias/email-validator/src/Validation/Exception/

- `EmptyValidationList.php` — Declares EmptyValidationList (~94 tok)

## backend/vendor/egulias/email-validator/src/Validation/Extra/

- `SpoofCheckValidation.php` — SpoofCheckValidation: isValid, getError, getWarnings (~289 tok)

## backend/vendor/egulias/email-validator/src/Warning/

- `AddressLiteral.php` — Declares AddressLiteral (~69 tok)
- `CFWSNearAt.php` — Declares CFWSNearAt (~61 tok)
- `CFWSWithFWS.php` — Declares CFWSWithFWS (~66 tok)
- `Comment.php` — Declares Comment (~58 tok)
- `DeprecatedComment.php` — Declares DeprecatedComment (~58 tok)
- `DomainLiteral.php` — Declares DomainLiteral (~65 tok)
- `EmailTooLong.php` — Declares EmailTooLong (~79 tok)
- `IPV6BadChar.php` — Declares IPV6BadChar (~69 tok)
- `IPV6ColonEnd.php` — Declares IPV6ColonEnd (~72 tok)
- `IPV6ColonStart.php` — Declares IPV6ColonStart (~73 tok)
- `IPV6Deprecated.php` — Declares IPV6Deprecated (~67 tok)
- `IPV6DoubleColon.php` — Declares IPV6DoubleColon (~70 tok)
- `IPV6GroupCount.php` — Declares IPV6GroupCount (~69 tok)
- `IPV6MaxGroups.php` — Declares IPV6MaxGroups (~74 tok)
- `LocalTooLong.php` — Declares LocalTooLong (~85 tok)
- `NoDNSMXRecord.php` — Declares NoDNSMXRecord (~72 tok)
- `ObsoleteDTEXT.php` — Declares ObsoleteDTEXT (~70 tok)
- `QuotedPart.php` — Declares QuotedPart (~163 tok)
- `QuotedString.php` — Declares QuotedString (~95 tok)
- `TLD.php` — Declares TLD (~52 tok)
- `Warning.php` — Warning: public const CODE = 0;, code, RFCNumber, __toString (~210 tok)

## backend/vendor/fakerphp/faker/

- `CHANGELOG.md` — Change log (~2210 tok)
- `composer.json` — PHP package manifest (~471 tok)
- `LICENSE` — Project license (~316 tok)
- `README.md` — Project documentation (~945 tok)
- `rector-migrate.php` (~1001 tok)

## backend/vendor/fakerphp/faker/src/

- `autoload.php` — Simple autoloader that follow the PHP Standards Recommendation #0 (PSR-0) (~236 tok)

## backend/vendor/fakerphp/faker/src/Faker/

- `ChanceGenerator.php` — This generator returns a default value for all called properties (~381 tok)
- `DefaultGenerator.php` — This generator returns a default value for all called properties (~274 tok)
- `Documentor.php` — Documentor: getFormatters (~643 tok)
- `Factory.php` — Create a new generator (~545 tok)
- `Generator.php` — Generator: class Generator (~6146 tok)
- `UniqueGenerator.php` — Proxy for other generators that returns only unique values. (~623 tok)
- `ValidGenerator.php` — Proxy for other generators, to return only valid values. Works with (~568 tok)

## backend/vendor/fakerphp/faker/src/Faker/Calculator/

- `Ean.php` — Utility class for validating EAN-8 and EAN-13 numbers (~302 tok)
- `Iban.php` — Generates IBAN Checksum (~431 tok)
- `Inn.php` — Inn: class Inn, Checks whether an INN has a valid checksum (~336 tok)
- `Isbn.php` — Utility class for validating ISBN-10 (~413 tok)
- `Luhn.php` — Utility class for generating and validating Luhn numbers. (~437 tok)
- `TCNo.php` — TCNo: class TCNo, Checks whether a TCNo has a valid checksum (~308 tok)

## backend/vendor/fakerphp/faker/src/Faker/Container/

- `Container.php` — A simple implementation of a container. (~1000 tok)
- `ContainerBuilder.php` — is: final class ContainerBuilder, build, withDefaultExtensions (~500 tok)
- `ContainerException.php` — Declares is (~80 tok)
- `ContainerInterface.php` — Interface: ContainerInterface (0 methods) (~44 tok)
- `NotInContainerException.php` — Declares is (~81 tok)

## backend/vendor/fakerphp/faker/src/Faker/Core/

- `Barcode.php` — is: ean13, ean8, isbn10, isbn13 (~339 tok)
- `Blood.php` — is: bloodType, bloodRh, bloodGroup (~219 tok)
- `Color.php` — is: final class Color implements Extension\ColorExtens, safeHexColor, rgbColorAsArray, rgbColor + 6 more (~1428 tok)
- `Coordinates.php` — is: final class Coordinates implements Extension\Exten, longitude, localCoordinates (~568 tok)
- `DateTime.php` — is: dateTime, dateTimeAD, dateTimeBetween, dateTimeInInterval + 17 more (~1682 tok)
- `File.php` — Declares is (~6323 tok)
- `Number.php` — is: numberBetween, randomDigit, randomDigitNot, randomDigitNotZero + 2 more (~523 tok)
- `Uuid.php` — is: uuid3 (~550 tok)
- `Version.php` — is: final class Version implements Extension\VersionEx (~564 tok)

## backend/vendor/fakerphp/faker/src/Faker/Extension/

- `AddressExtension.php` — Interface: is (6 methods) (~204 tok)
- `BarcodeExtension.php` — Interface: is (4 methods) (~226 tok)
- `BloodExtension.php` — Interface: is (3 methods) (~141 tok)
- `ColorExtension.php` — Interface: is (10 methods) (~303 tok)
- `CompanyExtension.php` — Interface: is (3 methods) (~103 tok)
- `CountryExtension.php` — Interface: is (1 methods) (~69 tok)
- `DateTimeExtension.php` — FakerPHP extension for Date-related randomization. (~2471 tok)
- `Extension.php` — An extension is the only way to add new functionality to Faker. (~67 tok)
- `ExtensionNotFound.php` — Declares is (~56 tok)
- `FileExtension.php` — Interface: is (3 methods) (~146 tok)
- `GeneratorAwareExtension.php` — Interface: is (1 methods) (~131 tok)
- `GeneratorAwareExtensionTrait.php` — A helper trait to be used with GeneratorAwareExtension. (~128 tok)
- `Helper.php` — A class with some methods that may make building extensions easier. (~859 tok)
- `NumberExtension.php` — Interface: is (6 methods) (~371 tok)
- `PersonExtension.php` — Interface: is (8 methods) (~300 tok)
- `PhoneNumberExtension.php` — Interface: is (2 methods) (~98 tok)
- `UuidExtension.php` — Interface: is (1 methods) (~91 tok)
- `VersionExtension.php` — Interface: is (1 methods) (~168 tok)

## backend/vendor/fakerphp/faker/src/Faker/Guesser/

- `Name.php` — Name: guessFormat (~1431 tok)

## backend/vendor/fakerphp/faker/src/Faker/ORM/CakePHP/

- `ColumnTypeGuesser.php` — ColumnTypeGuesser: guessFormat (~593 tok)
- `EntityPopulator.php` — EntityPopulator: __get, __set, mergeColumnFormattersWith, mergeModifiersWith + 4 more (~1227 tok)
- `Populator.php` — Populator: getGenerator, getGuessers, removeGuesser, addGuesser + 2 more (~672 tok)

## backend/vendor/fakerphp/faker/src/Faker/ORM/Doctrine/

- `backward-compatibility.php` (~109 tok)
- `ColumnTypeGuesser.php` — ColumnTypeGuesser: guessFormat (~717 tok)
- `EntityPopulator.php` — Service class for populating a table through a Doctrine Entity class. (~1967 tok)
- `Populator.php` — Service class for populating a database using the Doctrine ORM or ODM. (~954 tok)

## backend/vendor/fakerphp/faker/src/Faker/ORM/Mandango/

- `ColumnTypeGuesser.php` — ColumnTypeGuesser: protected $generator; (~365 tok)
- `EntityPopulator.php` — Service class for populating a table through a Mandango ActiveRecord class. (~880 tok)
- `Populator.php` — Service class for populating a database using Mandango. (~510 tok)

## backend/vendor/fakerphp/faker/src/Faker/ORM/Propel/

- `ColumnTypeGuesser.php` — ColumnTypeGuesser: guessFormat (~943 tok)
- `EntityPopulator.php` — Service class for populating a table through a Propel ActiveRecord class. (~1524 tok)
- `Populator.php` — Service class for populating a database using the Propel ORM. (~739 tok)

## backend/vendor/fakerphp/faker/src/Faker/ORM/Propel2/

- `ColumnTypeGuesser.php` — ColumnTypeGuesser: guessFormat (~938 tok)
- `EntityPopulator.php` — Service class for populating a table through a Propel ActiveRecord class. (~1553 tok)
- `Populator.php` — Service class for populating a database using the Propel ORM. (~769 tok)

## backend/vendor/fakerphp/faker/src/Faker/ORM/Spot/

- `ColumnTypeGuesser.php` — ColumnTypeGuesser constructor. (~608 tok)
- `EntityPopulator.php` — Service class for populating a table through a Spot Entity class. (~1355 tok)
- `Populator.php` — Service class for populating a database using the Spot ORM. (~690 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/

- `Address.php` — Address: citySuffix, streetSuffix, buildingNumber, city + 8 more (~953 tok)
- `Barcode.php` — Barcode: class Barcode extends Base, Get a random EAN8 barcode., Get a random ISBN-10 code, Get a random ISBN-13 code (~598 tok)
- `Base.php` — Base: protected $generator;, Returns a random number between 1 and 9, Generates a random digit, which cannot be $except, Returns a random integer w... (~6061 tok)
- `Biased.php` — Returns a biased integer between $min and $max (both inclusive). (~488 tok)
- `Color.php` — Color: hexColor, safeHexColor, rgbColorAsArray, rgbColor + 6 more (~1267 tok)
- `Company.php` — Company: company, companySuffix, jobTitle (~241 tok)
- `DateTime.php` — DateTime: protected static function getMaxTimestamp($max = ', Get a datetime object for a date between January 1, Get a datetime object for a date ... (~3303 tok)
- `File.php` — MIME types from the apache.org file. Some types are truncated. (~6856 tok)
- `HtmlLorem.php` — HtmlLorem: randomHtml (~2727 tok)
- `Image.php` — Depends on image generation from http://lorempixel.com/ (~1638 tok)
- `Internet.php` — Internet: protected static $localIpBlocks = [, final public function safeEmail(), companyEmail, freeEmailDomain + 11 more (~4454 tok)
- `Lorem.php` — Lorem: word, Generate an array of random words, Generate a random sentence, Generate an array of sentences + 3 more (~2103 tok)
- `Medical.php` — Medical: bloodType, bloodRh, bloodGroup (~173 tok)
- `Miscellaneous.php` — Miscellaneous: On date of 2017-03-26, md5, sha1, sha256 + 1 more (~3607 tok)
- `Payment.php` — Payment: protected static $cardParams = [, Returns the String of a credit card number., creditCardExpirationDate, creditCardExpirationDateString + ... (~2845 tok)
- `Person.php` — Person: name, firstName, firstNameMale, firstNameFemale + 4 more (~883 tok)
- `PhoneNumber.php` — PhoneNumber: protected static $e164Formats = [, e164PhoneNumber, International Mobile Equipment Identity (IMEI) (~1761 tok)
- `Text.php` — Generate a text string by the Markov chain algorithm. (~1816 tok)
- `UserAgent.php` — Possible processors on Linux (~2310 tok)
- `Uuid.php` — Generate name based md5 UUID (version 3). (~486 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/ar_EG/

- `Address.php` — Address: protected static $cityName = [, cityName, streetPrefix, secondaryAddress + 2 more (~2020 tok)
- `Color.php` — Declares Color (~354 tok)
- `Company.php` — Company: companyPrefix, catchPhrase, example 010101010, example 010101 (~545 tok)
- `Internet.php` — Internet: lastNameAscii, firstNameAscii, userName, domainName (~518 tok)
- `Payment.php` — International Bank Account Number (IBAN) (~87 tok)
- `Person.php` — Person: protected static $firstNameMale = [, nationalIdNumber (~2164 tok)
- `Text.php` — License: Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) (~2974 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/ar_JO/

- `Address.php` — Address: protected static $cityName = [, cityName, streetPrefix, secondaryAddress + 2 more (~1932 tok)
- `Company.php` — Company: companyPrefix, catchPhrase, bs (~414 tok)
- `Internet.php` — Internet: lastNameAscii, firstNameAscii, userName, domainName (~430 tok)
- `Person.php` — Declares Person (~3498 tok)
- `Text.php` — License: Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) (~26123 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/ar_SA/

- `Address.php` — Address: protected static $cityName = [, cityName, streetPrefix, secondaryAddress + 2 more (~2111 tok)
- `Color.php` — Declares Color (~1998 tok)
- `Company.php` — Company: companyPrefix, catchPhrase, bs, example 7001010101 (~480 tok)
- `Internet.php` — Internet: lastNameAscii, firstNameAscii, userName, domainName (~430 tok)
- `Payment.php` — International Bank Account Number (IBAN) (~182 tok)
- `Person.php` — Declares Person (~2892 tok)
- `Text.php` — License: Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) (~26123 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/at_AT/

- `Payment.php` — Declares Payment (~63 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/bg_BG/

- `Internet.php` — Declares Internet (~83 tok)
- `Payment.php` — International Bank Account Number (IBAN) (~373 tok)
- `Person.php` — Declares Person (~5659 tok)
- `PhoneNumber.php` — Declares PhoneNumber (~113 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/bn_BD/

- `Address.php` — Declares Address (~1953 tok)
- `Company.php` — Company: companyType, companyName (~144 tok)
- `Person.php` — Declares Person (~297 tok)
- `PhoneNumber.php` — PhoneNumber: phoneNumber (~71 tok)
- `Utils.php` — Utils: getBanglaNumber (~75 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/cs_CZ/

- `Address.php` — Source: https://cs.wikipedia.org/wiki/Seznam_m%C4%9Bst_v_%C4%8Cesku_podle_po%C4%8Dtu_obyvatel (~2339 tok)
- `Company.php` — Company: protected static $formats = [, Returns a random catch phrase attribute., Returns a random catch phrase verb., catchPhrase + 1 more (~940 tok)
- `DateTime.php` — Czech months and days without setting locale (~456 tok)
- `Internet.php` — Declares Internet (~85 tok)
- `Payment.php` — International Bank Account Number (IBAN) (~182 tok)
- `Person.php` — Declares Person (~8294 tok)
- `PhoneNumber.php` — Declares PhoneNumber (~70 tok)
- `Text.php` — License: PD old 70 (~122795 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/da_DK/

- `Address.php` — Declares Address (~4244 tok)
- `Company.php` — Company: protected static $formats = [, Generates a P entity number (10 digits). (~498 tok)
- `Internet.php` — Declares Internet (~163 tok)
- `Payment.php` — International Bank Account Number (IBAN) (~182 tok)
- `Person.php` — Declares Person (~4321 tok)
- `PhoneNumber.php` — Declares PhoneNumber (~91 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/de_AT/

- `Address.php` — Address: protected static $postcode = [, buildingNumber (~2934 tok)
- `Company.php` — Declares Company (~84 tok)
- `Internet.php` — Declares Internet (~70 tok)
- `Payment.php` — Value Added Tax (VAT) (~350 tok)
- `Person.php` — 60 most popular names in 1985, 1995, 2005 and 2015 (~3028 tok)
- `PhoneNumber.php` — Declares PhoneNumber (~122 tok)
- `Text.php` — Declares Text (~24 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/de_CH/

- `Address.php` — Address: protected static $cityNames = [, Returns a random street suffix., Returns a random street suffix., Returns a canton + 3 more (~2793 tok)
- `Company.php` — Declares Company (~89 tok)
- `Internet.php` — Declares Internet (~102 tok)
- `Payment.php` — International Bank Account Number (IBAN) (~182 tok)
- `Person.php` — Person: protected static $firstNameMale = [, Generates a valid random AVS13 (swiss social secur (~2106 tok)
- `PhoneNumber.php` — An array of Swiss mobile (cell) phone number formats. (~259 tok)
- `Text.php` — The Project Gutenberg EBook of Die Leiden des jungen Werther--Buch 1, by (~34623 tok)

## backend/vendor/fakerphp/faker/src/Faker/Provider/de_DE/

- `Address.php` — Declares Address (~4206 tok)
- `Company.php` — Declares Company (~358 tok)

## frontend/src/

- `vite-env.d.ts` — / <reference types="vite/client" /> (~11 tok)

## frontend/src/components/ui/

- `Badge.tsx` — variantClasses (~217 tok)

## frontend/src/pages/admin/

- `AdminBillingPage.tsx` — formatCurrency — renders table (~3651 tok)

## frontend/src/pages/salesman/

- `SalesmanBillingPage.tsx` — stripePromise — renders form (~6121 tok)

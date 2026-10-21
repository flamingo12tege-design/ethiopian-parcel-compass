# Home refresh
- [x] Replace repeated shortcuts with parcel status tiles and recent successful lookups.
- [x] Add a subtle colored postal-art background on Home.
- [x] Verify tracking tiles, search, and phone/desktop layout.

# Ethiopia calculator
- [x] Implement and verify Ethiopia-only confirmed postage rates.

# Tracking presentation
- [x] Correct recent live-carrier results, add custom service icons, and remove duplicated Profile links; verified live result on Home, service icons, and signed-out Profile.
- [x] Add custom live tracking loader and verify persistent bottom navigation during page changes.

# Android performance
- [x] Audit startup, requests, assets, dependencies, and native setup with baseline evidence.
- [x] Fix the stuck splash and other confirmed high-impact bottlenecks without changing features.
- [x] Verify public flows and document measurements and Android-only checks in docs/ANDROID_PERFORMANCE_AUDIT.md.
- [ ] Verify authenticated profile/notification flows — blocked by no signed-in requesting-user account.
- [ ] Compile and benchmark Android release — blocked by no published URL, Android project, Firebase config, or device environment.
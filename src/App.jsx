workflows:
  ios-simulator-build:
    name: iOS Simulator Build (bez podpisywania)
    instance_type: mac_mini_m2
    max_build_duration: 60
    environment:
      node: 20
    scripts:
      - name: Instalacja zależności
        script: npm install
      - name: Budowanie strony
        script: npm run build
      - name: Dodanie platformy iOS (jeśli brakuje)
        script: |
          test -d ios || npx cap add ios
      - name: Synchronizacja Capacitor
        script: npx cap sync ios
      - name: Instalacja CocoaPods
        script: cd ios/App && pod install
      - name: Budowanie na symulator (bez podpisywania)
        script: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace \
            -scheme App \
            -configuration Debug \
            -sdk iphonesimulator \
            -derivedDataPath build \
            CODE_SIGNING_ALLOWED=NO
    artifacts:
      - ios/App/build/Build/Products/Debug-iphonesimulator/*.app
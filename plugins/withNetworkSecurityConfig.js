const { withAndroidManifest } = require('expo/config-plugins');
const { mkdirSync, copyFileSync, existsSync } = require('fs');
const path = require('path');

/**
 * Expo Config Plugin: Adds a custom Android network_security_config.xml
 * that trusts user-installed certificates (e.g. self-signed certs on internal domains).
 *
 * This is needed because React Native on Android rejects self-signed SSL certificates
 * by default. Internal domains like .dom often use self-signed certs.
 */
function withNetworkSecurityConfig(config) {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;

        // Add networkSecurityConfig attribute to <application>
        const application = androidManifest.manifest.application?.[0];
        if (application) {
            application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
        }

        // Copy the XML file to android/app/src/main/res/xml/
        const projectRoot = config.modRequest.projectRoot;
        const xmlDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml');
        const srcFile = path.join(projectRoot, 'plugins', 'network_security_config.xml');
        const destFile = path.join(xmlDir, 'network_security_config.xml');

        if (!existsSync(xmlDir)) {
            mkdirSync(xmlDir, { recursive: true });
        }

        if (existsSync(srcFile)) {
            copyFileSync(srcFile, destFile);
            console.log('[Plugin] Copied network_security_config.xml to android/app/src/main/res/xml/');
        } else {
            console.warn('[Plugin] network_security_config.xml not found in plugins/');
        }

        return config;
    });
}

module.exports = withNetworkSecurityConfig;

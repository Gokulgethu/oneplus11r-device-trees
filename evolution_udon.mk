#
# Copyright (C) 2023-2026 The Evolution X Project
#
# SPDX-License-Identifier: Apache-2.0
#

# Inherit from those products. Most specific first.
$(call inherit-product, $(SRC_TARGET_DIR)/product/core_64_bit.mk)
$(call inherit-product, $(SRC_TARGET_DIR)/product/full_base_telephony.mk)

# Inherit Evolution X / Lineage common configuration
$(call inherit-product-if-exists, vendor/evolution/config/common.mk)
$(call inherit-product-if-exists, vendor/lineage/config/common.mk)
$(call inherit-product-if-exists, vendor/lineage/config/common_full_phone.mk)

# Inherit from udon device
$(call inherit-product, $(LOCAL_PATH)/device.mk)

# Device identifier. This must come after all inclusions
PRODUCT_BRAND := OnePlus
PRODUCT_DEVICE := udon
PRODUCT_MANUFACTURER := OnePlus
PRODUCT_NAME := evolution_udon
PRODUCT_MODEL := CPH2487

PRODUCT_GMS_CLIENTID_BASE := android-oneplus
TARGET_VENDOR := oneplus
TARGET_VENDOR_PRODUCT_NAME := udon

# Evolution X Build Flags & Customizations (Android 17 / v12.1 cnb)
EVO_BUILD_TYPE ?= Unofficial
WITH_GMS ?= true
TARGET_BOOT_ANIMATION_RES := 1080
TARGET_SUPPORTS_QUICK_TAP := true
TARGET_HAS_UDFPS := true
EXTRA_UDFPS_ANIMATIONS := true
TARGET_FACE_UNLOCK_SUPPORTED := true
TARGET_INCLUDE_PIXEL_CHARGER := true
TARGET_INCLUDE_STOCK_ARCORE := true

# Screen Resolution for Boot Animations & Themes (1240 x 2772 AMOLED)
TARGET_SCREEN_WIDTH := 1240
TARGET_SCREEN_HEIGHT := 2772

# Maintainer Info
EVO_MAINTAINER := Gokulgethu

# Fingerprint & Build Properties (OxygenOS 16 / Android 17 base)
PRODUCT_BUILD_PROP_OVERRIDES += \
    PRIVATE_BUILD_DESC="CPH2487-user 16 BP2A.250605.015 T.R4T3.2e09920 release-keys" \
    BuildDesc="CPH2487-user 16 BP2A.250605.015 T.R4T3.2e09920 release-keys" \
    BuildFingerprint=OnePlus/CPH2487/OP5961L1:16/BP2A.250605.015/T.R4T3.2e09920-970cae-a2101f:user/release-keys \
    DeviceProduct=udon

BUILD_FINGERPRINT := OnePlus/CPH2487/OP5961L1:16/BP2A.250605.015/T.R4T3.2e09920-970cae-a2101f:user/release-keys


#
# Copyright (C) 2023-2026 The PixelOS Project
#
# SPDX-License-Identifier: Apache-2.0
#

# Inherit from those products. Most specific first.
$(call inherit-product, $(SRC_TARGET_DIR)/product/core_64_bit.mk)
$(call inherit-product, $(SRC_TARGET_DIR)/product/full_base_telephony.mk)

# Inherit from the udon / CPH2487 device tree
$(call inherit-product, $(LOCAL_PATH)/device.mk)

# Inherit PixelOS common configuration.
# PixelOS ships vendor/custom (its own layer) and a fork of LineageOS'
# vendor/lineage; older branches only had vendor/pixelos.
ifneq ($(wildcard vendor/custom/config/common_full_phone.mk),)
$(call inherit-product, vendor/custom/config/common_full_phone.mk)
else ifneq ($(wildcard vendor/pixelos/config/common.mk),)
$(call inherit-product, vendor/pixelos/config/common.mk)
else
$(call inherit-product, vendor/lineage/config/common_full_phone.mk)
endif

PRODUCT_BRAND := OnePlus
PRODUCT_DEVICE := udon
PRODUCT_MANUFACTURER := OnePlus
PRODUCT_NAME := pixelos_udon
PRODUCT_MODEL := CPH2487
PRODUCT_SYSTEM_NAME := CPH2487
PRODUCT_SYSTEM_DEVICE := OP5961L1

PRODUCT_GMS_CLIENTID_BASE := android-oneplus
TARGET_VENDOR := oneplus
TARGET_VENDOR_PRODUCT_NAME := udon

PRODUCT_BUILD_PROP_OVERRIDES += PRIVATE_BUILD_DESC="CPH2487-user 16 BP2A.250605.015 T.R4T3.2e09920 release-keys"

# Exact build fingerprint from official OxygenOS firmware
BUILD_FINGERPRINT := OnePlus/CPH2487/OP5961L1:16/BP2A.250605.015/T.R4T3.2e09920-970cae-a2101f:user/release-keys

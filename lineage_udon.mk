#
# Copyright (C) 2023-2026 The LineageOS Project
#
# SPDX-License-Identifier: Apache-2.0
#
# Product makefile for OnePlus 11R 5G (udon / CPH2487).
#
# Used by both LineageOS 23.x and DerpFest 16.x -- DerpFest ships its
# vendor fork at vendor/lineage and keeps the lineage_<codename> product
# naming, so a single makefile serves both.
#
#   lunch lineage_udon-userdebug
#

# Inherit from those products. Most specific first.
$(call inherit-product, $(SRC_TARGET_DIR)/product/core_64_bit_only.mk)
$(call inherit-product, $(SRC_TARGET_DIR)/product/full_base_telephony.mk)

# Inherit from udon device
$(call inherit-product, $(LOCAL_PATH)/device.mk)

# Inherit some common Lineage/DerpFest stuff.
$(call inherit-product, vendor/lineage/config/common_full_phone.mk)

# DerpFest
DERPFEST_BUILD_TYPE := Unofficial

PRODUCT_NAME := lineage_udon
PRODUCT_DEVICE := udon
PRODUCT_MANUFACTURER := OnePlus
PRODUCT_BRAND := OnePlus
PRODUCT_MODEL := CPH2487

PRODUCT_GMS_CLIENTID_BASE := android-oneplus

# Fingerprint spoofing of the stock OxygenOS build.
#
# NOTE: verify these against the OxygenOS build you actually dumped blobs
# from -- a mismatch between the fingerprint here and the vendor partition
# is a common cause of SafetyNet/Play Integrity and IMS failures.
PRODUCT_BUILD_PROP_OVERRIDES += \
    BuildDesc="CPH2487-user 16 BP2A.250605.015 T.R4T3.2e09920 release-keys" \
    BuildFingerprint=OnePlus/CPH2487/OP5961L1:16/BP2A.250605.015/T.R4T3.2e09920-970cae-a2101f:user/release-keys \
    DeviceName=OP5961L1 \
    DeviceProduct=CPH2487 \
    SystemDevice=OP5961L1 \
    SystemName=CPH2487

#
# PixelOS product makefile — OnePlus 11R 5G (udon / CPH2487)
#
# Injected into device/oneplus/udon/ by crave/build-pixelos-udon.sh.
# It is intentionally minimal: everything device specific comes from the
# device tree (device/oneplus/udon/device.mk -> sm8450-common + vendor blobs),
# everything ROM specific comes from PixelOS.
#
# SPDX-License-Identifier: Apache-2.0
#

# Base AOSP product config
$(call inherit-product, $(SRC_TARGET_DIR)/product/core_64_bit.mk)
$(call inherit-product, $(SRC_TARGET_DIR)/product/full_base_telephony.mk)

# Device tree (must come first so ROM config can override)
$(call inherit-product, device/oneplus/udon/device.mk)

# PixelOS common configuration. PixelOS ships vendor/custom (its own layer) and
# a fork of Lineage's vendor/lineage; fall back to the latter if the former is
# not present on this branch.
ifneq ($(wildcard vendor/custom/config/common_full_phone.mk),)
$(call inherit-product, vendor/custom/config/common_full_phone.mk)
else
$(call inherit-product, vendor/lineage/config/common_full_phone.mk)
endif

# Device identity
PRODUCT_NAME := pixelos_udon
PRODUCT_DEVICE := udon
PRODUCT_MANUFACTURER := OnePlus
PRODUCT_BRAND := OnePlus
PRODUCT_MODEL := CPH2487
PRODUCT_SYSTEM_NAME := CPH2487
PRODUCT_SYSTEM_DEVICE := OP5961L1

PRODUCT_GMS_CLIENTID_BASE := android-oneplus

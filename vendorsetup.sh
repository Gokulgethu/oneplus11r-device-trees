#
# Copyright (C) 2023-2026 The Android Open Source Project
#
# SPDX-License-Identifier: Apache-2.0
#

for variant in user userdebug eng; do
    add_lunch_combo lineage_udon-${variant}
    add_lunch_combo lineage_CPH2487-${variant}
    add_lunch_combo aosp_udon-${variant}
    add_lunch_combo crdroid_udon-${variant}
    add_lunch_combo evolution_udon-${variant}
    add_lunch_combo rising_udon-${variant}
done

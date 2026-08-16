#pragma once

#include <array>
#include <cstdint>
#include <span>
#include <string_view>

namespace ptdt::engine {

struct EcefCoordinate final {
    double x_m{};
    double y_m{};
    double z_m{};
};

struct EngineFrameView final {
    std::string_view frame_id{};
    std::string_view authority_snapshot_id{};
    std::string_view timestamp_utc{};
    std::string_view crs{};
    std::string_view vertical_datum{};
    EcefCoordinate ecef{};
    std::string_view content_hash{};
    std::string_view validation_status{};
    std::uint64_t timestamp_epoch_ms{};
    std::uint32_t timestep_index{};
    float calculated_wse_navd88_ft{};
    std::span<const std::byte> depth_float32{};
};

class IEngineFrameSink {
public:
    virtual ~IEngineFrameSink() = default;
    virtual void publish(const EngineFrameView& frame) = 0;
};

constexpr bool is_sha256_hex(std::string_view value) noexcept {
    if (value.size() != 64) return false;
    for (const char c : value) {
        const bool digit = c >= '0' && c <= '9';
        const bool lower = c >= 'a' && c <= 'f';
        if (!(digit || lower)) return false;
    }
    return true;
}

constexpr bool is_valid_scene_state(const EngineFrameView& frame) noexcept {
    return frame.crs == "EPSG:2966" &&
           frame.vertical_datum == "NAVD88" &&
           frame.validation_status == "VALID" &&
           is_sha256_hex(frame.content_hash);
}

} // namespace ptdt::engine

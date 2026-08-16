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
    std::uint64_t timestamp_epoch_ms{};
    std::uint32_t timestep_index{};
    float calculated_wse_navd88_ft{};
    EcefCoordinate ecef{};
    std::string_view evidence_hash{};
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
        const bool upper = c >= 'A' && c <= 'F';
        if (!(digit || lower || upper)) return false;
    }
    return true;
}

} // namespace ptdt::engine

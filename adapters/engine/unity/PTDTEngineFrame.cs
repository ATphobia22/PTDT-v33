using System;
using System.Linq;
using System.Runtime.InteropServices;

namespace PTDT.Engine;

[StructLayout(LayoutKind.Sequential, Pack = 1)]
public readonly struct EcefCoordinate
{
    public readonly double X;
    public readonly double Y;
    public readonly double Z;

    public EcefCoordinate(double x, double y, double z) => (X, Y, Z) = (x, y, z);
}

public sealed record EngineFrame(
    ulong TimestampEpochMs,
    uint TimestepIndex,
    float CalculatedWseNavd88Ft,
    EcefCoordinate GeocentricAnchorEpsg4978,
    string EvidenceHash,
    ReadOnlyMemory<byte> DepthFloat32);

public interface IEngineFrameSink
{
    void Publish(EngineFrame frame);
}

public static class EvidenceHashVerifier
{
    public static bool IsSha256Hex(string value) =>
        value.Length == 64 && value.All(Uri.IsHexDigit);
}

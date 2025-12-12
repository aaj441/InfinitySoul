"""
The Metronome: Keeps the beat at 30-second quote cycles.
"""

from typing import List
import time


class Metronome:
    """
    The Metronome keeps the tempo steady.
    In InfinitySoul, the beat is 30 seconds per quote.
    If agents are too slow, the Conductor adjusts.
    """
    
    def __init__(self, bpm: int = 30):
        """
        Initialize the metronome.
        
        Args:
            bpm: Beats per minute. Default 30 = 30-second cycles.
                 (Actually, we measure in seconds, but the metaphor is BPM)
        """
        self.bpm = bpm
        self.threshold = 30.0  # 30 seconds max latency
        self.last_beat = time.time()
    
    def beat(self) -> float:
        """
        Mark a beat and return time since last beat.
        
        Returns:
            Seconds elapsed since last beat
        """
        now = time.time()
        elapsed = now - self.last_beat
        self.last_beat = now
        return elapsed
    
    def calibrate(self, latency_spikes: List[float]) -> float:
        """
        Calibrate the tempo based on latency spikes.
        
        If agents are consistently slow, we need to adjust expectations.
        This returns a tempo_adjustment value.
        
        Args:
            latency_spikes: List of latency values exceeding threshold
            
        Returns:
            Tempo adjustment (-1.0 to 1.0)
        """
        if not latency_spikes:
            return 0.0
        
        avg_spike = sum(latency_spikes) / len(latency_spikes)
        
        # If average spike is 2x threshold, we need to slow down significantly
        if avg_spike > self.threshold * 2:
            return -0.5  # Slow down 50%
        elif avg_spike > self.threshold * 1.5:
            return -0.3  # Slow down 30%
        elif avg_spike > self.threshold:
            return -0.1  # Slow down 10%
        else:
            return 0.0  # No adjustment needed
    
    def is_on_beat(self, timestamp: float) -> bool:
        """
        Check if an action happened on the beat.
        
        Args:
            timestamp: Unix timestamp to check
            
        Returns:
            True if within threshold of expected beat
        """
        expected_interval = 60.0 / self.bpm
        elapsed = timestamp - self.last_beat
        
        # Allow 10% variance
        variance = expected_interval * 0.1
        return abs(elapsed - expected_interval) <= variance

import time
import math

DECAY_HALF_LIFE_DAYS = 30

def decay_score(timestamp, severity):
    age_days = (time.time() - timestamp) / 86400
    decay = math.exp(-age_days / DECAY_HALF_LIFE_DAYS)
    severity_boost = 1 + (severity / 5)
    return decay * severity_boost

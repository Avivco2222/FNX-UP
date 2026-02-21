export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_taxonomy_suggestions: {
        Row: {
          id: string
          suggestion_type: string
          status: string
          payload: Json
          created_by: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          suggestion_type: string
          status: string
          payload: Json
          created_by?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          suggestion_type?: string
          status?: string
          payload?: Json
          created_by?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_widgets: {
        Row: {
          key: string
          label: string | null
          is_visible: boolean | null
          order_index: number | null
        }
        Insert: {
          key: string
          label?: string | null
          is_visible?: boolean | null
          order_index?: number | null
        }
        Update: {
          key?: string
          label?: string | null
          is_visible?: boolean | null
          order_index?: number | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          rarity: string
          status: string
          xp_bonus: number
          coin_bonus: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          rarity: string
          status: string
          xp_bonus: number
          coin_bonus: number
          metadata: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          rarity?: string
          status?: string
          xp_bonus?: number
          coin_bonus?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string | null
          role: string
          content: string
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          role: string
          content: string
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          role?: string
          content?: string
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          title: string
          provider: string
          url: string | null
          image_url: string | null
          duration_hours: number | null
          skill_id: string | null
          min_level_grant: number | null
          xp_reward: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          provider: string
          url?: string | null
          image_url?: string | null
          duration_hours?: number | null
          skill_id?: string | null
          min_level_grant?: number | null
          xp_reward?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          provider?: string
          url?: string | null
          image_url?: string | null
          duration_hours?: number | null
          skill_id?: string | null
          min_level_grant?: number | null
          xp_reward?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      dojo_scenarios: {
        Row: {
          id: string
          title: string
          description: string | null
          difficulty: string | null
          category: string | null
          initial_ai_message: string | null
          xp_reward: number | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          difficulty?: string | null
          category?: string | null
          initial_ai_message?: string | null
          xp_reward?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          difficulty?: string | null
          category?: string | null
          initial_ai_message?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      feed_events: {
        Row: {
          id: string
          event_type: string
          actor_user_id: string | null
          subject_user_id: string | null
          org_unit_id: string | null
          entity_table: string | null
          entity_id: string | null
          visibility: string
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          actor_user_id?: string | null
          subject_user_id?: string | null
          org_unit_id?: string | null
          entity_table?: string | null
          entity_id?: string | null
          visibility: string
          payload: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          actor_user_id?: string | null
          subject_user_id?: string | null
          org_unit_id?: string | null
          entity_table?: string | null
          entity_id?: string | null
          visibility?: string
          payload?: Json
          created_at?: string
        }
        Relationships: []
      }
      gig_participants: {
        Row: {
          id: string
          gig_id: string
          user_id: string
          status: string
          applied_at: string
          accepted_at: string | null
          started_at: string | null
          completed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          gig_id: string
          user_id: string
          status: string
          applied_at: string
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          gig_id?: string
          user_id?: string
          status?: string
          applied_at?: string
          accepted_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      gig_skills: {
        Row: {
          gig_id: string
          skill_id: string
          required_level: number
          weight: number
          is_mandatory: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          gig_id: string
          skill_id: string
          required_level: number
          weight: number
          is_mandatory: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          gig_id?: string
          skill_id?: string
          required_level?: number
          weight?: number
          is_mandatory?: boolean
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      gigs: {
        Row: {
          id: string
          title: string
          department: string | null
          description: string | null
          estimated_hours: number | null
          xp_reward: number | null
          skills_required: Json | null
          status: string | null
          owner_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          department?: string | null
          description?: string | null
          estimated_hours?: number | null
          xp_reward?: number | null
          skills_required?: Json | null
          status?: string | null
          owner_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          department?: string | null
          description?: string | null
          estimated_hours?: number | null
          xp_reward?: number | null
          skills_required?: Json | null
          status?: string | null
          owner_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          id: string
          job_id: string
          user_id: string
          status: string
          applied_at: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          status: string
          applied_at: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          status?: string
          applied_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_shadowing_requests: {
        Row: {
          id: string
          user_id: string | null
          job_id: string | null
          status: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          job_id?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          job_id?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      job_skills: {
        Row: {
          job_id: string
          skill_id: string
          required_level: number
          weight: number
          is_mandatory: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          job_id: string
          skill_id: string
          required_level: number
          weight: number
          is_mandatory: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          job_id?: string
          skill_id?: string
          required_level?: number
          weight?: number
          is_mandatory?: boolean
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          code: string
          title: string
          description: string | null
          org_unit_id: string | null
          location: string | null
          job_type: string
          level_band: string | null
          status: string
          xp_reward: number
          coin_reward: number
          referral_bonus_coins: number
          internal_xp: number | null
          referral_coins: number | null
          is_hot: boolean | null
          tags: string[] | null
          recruiter_email: string | null
          department: string | null
          created_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description?: string | null
          org_unit_id?: string | null
          location?: string | null
          job_type?: string
          level_band?: string | null
          status?: string
          xp_reward?: number
          coin_reward?: number
          referral_bonus_coins?: number
          internal_xp?: number | null
          referral_coins?: number | null
          is_hot?: boolean | null
          tags?: string[] | null
          recruiter_email?: string | null
          department?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string | null
          org_unit_id?: string | null
          location?: string | null
          job_type?: string
          level_band?: string | null
          status?: string
          xp_reward?: number
          coin_reward?: number
          referral_bonus_coins?: number
          internal_xp?: number | null
          referral_coins?: number | null
          is_hot?: boolean | null
          tags?: string[] | null
          recruiter_email?: string | null
          department?: string | null
          created_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      kudos: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string | null
          category: string | null
          message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string | null
          category?: string | null
          message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string | null
          category?: string | null
          message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      level_definitions: {
        Row: {
          level: number
          min_total_xp: number
          title: string
          perks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          level: number
          min_total_xp: number
          title: string
          perks: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          level?: number
          min_total_xp?: number
          title?: string
          perks?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_memberships: {
        Row: {
          id: string
          user_id: string
          org_unit_id: string
          is_primary: boolean
          start_date: string | null
          end_date: string | null
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_unit_id: string
          is_primary: boolean
          start_date?: string | null
          end_date?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          org_unit_id?: string
          is_primary?: boolean
          start_date?: string | null
          end_date?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_units: {
        Row: {
          id: string
          code: string
          name: string
          unit_type: string
          parent_org_unit_id: string | null
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          unit_type: string
          parent_org_unit_id?: string | null
          status: string
          metadata: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          unit_type?: string
          parent_org_unit_id?: string | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      playlist_items: {
        Row: {
          playlist_id: string
          course_id: string
          order_index: number | null
        }
        Insert: {
          playlist_id: string
          course_id: string
          order_index?: number | null
        }
        Update: {
          playlist_id?: string
          course_id?: string
          order_index?: number | null
        }
        Relationships: []
      }
      playlists: {
        Row: {
          id: string
          title: string
          description: string | null
          curator_name: string | null
          curator_role: string | null
          curator_image: string | null
          cover_image: string | null
          xp_reward: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          curator_name?: string | null
          curator_role?: string | null
          curator_image?: string | null
          cover_image?: string | null
          xp_reward?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          curator_name?: string | null
          curator_role?: string | null
          curator_image?: string | null
          cover_image?: string | null
          xp_reward?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          poll_id: string
          user_id: string
          option_index: number
        }
        Insert: {
          poll_id: string
          user_id: string
          option_index: number
        }
        Update: {
          poll_id?: string
          user_id?: string
          option_index?: number
        }
        Relationships: []
      }
      polls: {
        Row: {
          id: string
          question: string
          options: Json
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          question: string
          options: Json
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          question?: string
          options?: Json
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          id: string
          post_id: string | null
          user_id: string | null
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          content?: string
          created_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string | null
          content: string
          post_type: string
          image_url: string | null
          likes_count: number | null
          comments_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          content: string
          post_type: string
          image_url?: string | null
          likes_count?: number | null
          comments_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          content?: string
          post_type?: string
          image_url?: string | null
          likes_count?: number | null
          comments_count?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string | null
          xp_reward: number | null
          coin_reward: number | null
          quest_type: string | null
          action_link: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          xp_reward?: number | null
          coin_reward?: number | null
          quest_type?: string | null
          action_link?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          xp_reward?: number | null
          coin_reward?: number | null
          quest_type?: string | null
          action_link?: string | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      referral_payouts: {
        Row: {
          id: string
          referral_id: string | null
          user_id: string | null
          rule_id: string | null
          amount_cash: number | null
          amount_coins: number | null
          status: string | null
          processed_at: string | null
          created_at: string | null
          maturity_date: string | null
          is_eligible: boolean | null
          rejection_reason: string | null
        }
        Insert: {
          id?: string
          referral_id?: string | null
          user_id?: string | null
          rule_id?: string | null
          amount_cash?: number | null
          amount_coins?: number | null
          status?: string | null
          processed_at?: string | null
          created_at?: string | null
          maturity_date?: string | null
          is_eligible?: boolean | null
          rejection_reason?: string | null
        }
        Update: {
          id?: string
          referral_id?: string | null
          user_id?: string | null
          rule_id?: string | null
          amount_cash?: number | null
          amount_coins?: number | null
          status?: string | null
          processed_at?: string | null
          created_at?: string | null
          maturity_date?: string | null
          is_eligible?: boolean | null
          rejection_reason?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string | null
          job_id: string | null
          candidate_name: string
          candidate_phone: string | null
          candidate_email: string | null
          cv_url: string | null
          status: string | null
          bonus_amount: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          referrer_id?: string | null
          job_id?: string | null
          candidate_name: string
          candidate_phone?: string | null
          candidate_email?: string | null
          cv_url?: string | null
          status?: string | null
          bonus_amount?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string | null
          job_id?: string | null
          candidate_name?: string
          candidate_phone?: string | null
          candidate_email?: string | null
          cv_url?: string | null
          status?: string | null
          bonus_amount?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_rules: {
        Row: {
          id: string
          title: string
          job_id: string | null
          target_department: string | null
          trigger_status: string
          cash_reward: number | null
          coin_reward: number | null
          xp_reward: number | null
          start_date: string | null
          end_date: string | null
          is_active: boolean | null
          payment_delay_days: number | null
          excluded_departments: Json | null
        }
        Insert: {
          id?: string
          title: string
          job_id?: string | null
          target_department?: string | null
          trigger_status: string
          cash_reward?: number | null
          coin_reward?: number | null
          xp_reward?: number | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean | null
          payment_delay_days?: number | null
          excluded_departments?: Json | null
        }
        Update: {
          id?: string
          title?: string
          job_id?: string | null
          target_department?: string | null
          trigger_status?: string
          cash_reward?: number | null
          coin_reward?: number | null
          xp_reward?: number | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean | null
          payment_delay_days?: number | null
          excluded_departments?: Json | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      season_tiers: {
        Row: {
          id: string
          season_id: string | null
          tier_level: number
          xp_required: number
          reward_description: string | null
          reward_image_url: string | null
        }
        Insert: {
          id?: string
          season_id?: string | null
          tier_level: number
          xp_required: number
          reward_description?: string | null
          reward_image_url?: string | null
        }
        Update: {
          id?: string
          season_id?: string | null
          tier_level?: number
          xp_required?: number
          reward_description?: string | null
          reward_image_url?: string | null
        }
        Relationships: []
      }
      seasons: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_active: boolean | null
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          is_active?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      skill_aliases: {
        Row: {
          id: string
          skill_id: string
          alias: string
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          skill_id: string
          alias: string
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          skill_id?: string
          alias?: string
          source?: string | null
          created_at?: string
        }
        Relationships: []
      }
      skill_endorsements: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          endorser_user_id: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          endorser_user_id: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          endorser_user_id?: string
          message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      skill_relations: {
        Row: {
          id: string
          from_skill_id: string
          to_skill_id: string
          relation: string
          weight: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_skill_id: string
          to_skill_id: string
          relation: string
          weight: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_skill_id?: string
          to_skill_id?: string
          relation?: string
          weight?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          slug: string
          name: string
          category: string
          description: string | null
          skill_type: string
          status: string
          is_verified: boolean
          parent_skill_id: string | null
          source: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          category: string
          description?: string | null
          skill_type: string
          status: string
          is_verified: boolean
          parent_skill_id?: string | null
          source?: string | null
          metadata: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          category?: string
          description?: string | null
          skill_type?: string
          status?: string
          is_verified?: boolean
          parent_skill_id?: string | null
          source?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      trivia_questions: {
        Row: {
          id: string
          skill_id: string | null
          question: string
          correct_answer: string
          wrong_answers: Json
          difficulty: string | null
        }
        Insert: {
          id?: string
          skill_id?: string | null
          question: string
          correct_answer: string
          wrong_answers: Json
          difficulty?: string | null
        }
        Update: {
          id?: string
          skill_id?: string | null
          question?: string
          correct_answer?: string
          wrong_answers?: Json
          difficulty?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          user_id: string
          badge_id: string
          awarded_at: string
          awarded_by: string | null
          reason: string | null
          metadata: Json
        }
        Insert: {
          user_id: string
          badge_id: string
          awarded_at: string
          awarded_by?: string | null
          reason?: string | null
          metadata: Json
        }
        Update: {
          user_id?: string
          badge_id?: string
          awarded_at?: string
          awarded_by?: string | null
          reason?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          assigned_by: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          assigned_by?: string | null
          assigned_at: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          assigned_by?: string | null
          assigned_at?: string
        }
        Relationships: []
      }
      user_season_progress: {
        Row: {
          user_id: string
          season_id: string
          current_tier: number | null
          season_xp: number | null
        }
        Insert: {
          user_id: string
          season_id: string
          current_tier?: number | null
          season_xp?: number | null
        }
        Update: {
          user_id?: string
          season_id?: string
          current_tier?: number | null
          season_xp?: number | null
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          user_id: string
          skill_id: string
          skill_level: number
          skill_xp: number
          endorsement_count: number
          last_endorsed_at: string | null
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          source: string | null
          evidence_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          skill_id: string
          skill_level: number
          skill_xp: number
          endorsement_count: number
          last_endorsed_at?: string | null
          is_verified: boolean
          verified_by?: string | null
          verified_at?: string | null
          source?: string | null
          evidence_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          skill_id?: string
          skill_level?: number
          skill_xp?: number
          endorsement_count?: number
          last_endorsed_at?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          source?: string | null
          evidence_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          employee_id: string | null
          email: string | null
          display_name: string | null
          headline: string | null
          bio: string | null
          location: string | null
          role_title: string | null
          avatar_url: string | null
          hire_date: string | null
          is_active: boolean
          manager_user_id: string | null
          current_level: number
          current_xp: number
          coins_balance: number
          avatar_config: Json
          metadata: Json
          created_at: string
          updated_at: string
          is_open_to_opportunities: boolean | null
          last_login_date: string | null
          current_streak: number | null
          department: string | null
        }
        Insert: {
          id?: string
          employee_id?: string | null
          email?: string | null
          display_name?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          role_title?: string | null
          avatar_url?: string | null
          hire_date?: string | null
          is_active: boolean
          manager_user_id?: string | null
          current_level: number
          current_xp: number
          coins_balance: number
          avatar_config: Json
          metadata: Json
          created_at?: string
          updated_at?: string
          is_open_to_opportunities?: boolean | null
          last_login_date?: string | null
          current_streak?: number | null
          department?: string | null
        }
        Update: {
          id?: string
          employee_id?: string | null
          email?: string | null
          display_name?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          role_title?: string | null
          avatar_url?: string | null
          hire_date?: string | null
          is_active?: boolean
          manager_user_id?: string | null
          current_level?: number
          current_xp?: number
          coins_balance?: number
          avatar_config?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
          is_open_to_opportunities?: boolean | null
          last_login_date?: string | null
          current_streak?: number | null
          department?: string | null
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          source_type: string
          source_id: string | null
          source_label: string | null
          xp_amount: number
          coin_amount: number
          created_by: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_type: string
          source_id?: string | null
          source_label?: string | null
          xp_amount: number
          coin_amount: number
          created_by?: string | null
          metadata: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_type?: string
          source_id?: string | null
          source_label?: string | null
          xp_amount?: number
          coin_amount?: number
          created_by?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
